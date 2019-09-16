import FeatureCollection from './FeaturesCollection';
import Regions from './regions'

export default class YandexMap {
    constructor(){
        this.map = null;
        this.objectManager = null;
        this.regions = {
            collection: null,
            objectManager: null,
            visibility : true,
        };
        this.eventHadler  = null;
        this.data = new FeatureCollection();
    }


    setCenter(){

    }

    async init()
    {
        await ymaps.ready();
        this._initMap();
        this._initCluster();
        this._setEvents();
        await this._setRegions();
        return true
    }

    

    _setEvents(){
        this.eventHandler = this.map.events.group();

        const setOpacity = (num)=>{
            let newArr = this.regions.collection.features.features.map(element=>{
                let  opacity = parseFloat(element.options.fillOpacity);
                if(opacity !== num){
                    element.options.fillOpacity = num.toString();
                    this.regions.objectManager.objects.setObjectOptions(element.id,element.options);
                }
                return element;
            });
            this.regions.collection.addCollection(newArr);
        }
        const setVisibility = (bool)=>{
            this.regions.objectManager.setFilter((obj)=>{
                return bool;
            });
        }
        this.eventHandler.add('boundschange',(function(){
            let zoom = this.map.getZoom();
            if(zoom > 7){
                if(this.regions.visibility)
                {
                    setVisibility(false);
                    this.regions.visibility = false;
                }
            }else if(zoom === 6 || zoom ===7){
                setOpacity(0.5);
                if(!this.regions.visibility)
                {
                    setVisibility(true);
                    this.regions.visibility = true;
                }
            }
            else{
                setOpacity(1.0);
                if(!this.regions.visibility)
                {
                    setVisibility(true);
                    this.regions.visibility = true;
                }
            }
        }).bind(this))
    }


    _initMap(){
        let map = new ymaps.Map(
            'map',
            {
              center: [55.751574, 37.573856],
              zoom: 3,
              behaviors: ['default', 'scrollZoom']
            },
            {
              searchControlProvider: 'yandex#search'
            }
        )
        this.map = map;
    }

    _initCluster(){
        let objectManager = new ymaps.ObjectManager({
            clusterize: true,

            preset: 'islands#invertedVioletClusterIcons',

            // clusterBalloonContentLayout: 'cluster#balloonAccordion',
            groupByCoordinates: false,

            // clusterDisableClickZoom: false,
            // clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false
        });
        this.map.geoObjects.add(objectManager);
        this.objectManager = objectManager;
    }

    getPointData  (params) {
        return {
          balloonContent:
            `<table class="table-google-info"><tbody><tr><td align="center" class="head">${params.name} </td></tr><tr><td align="center">${params.address} 
            </td></tr><tr><td align="center"><span class="phone">${params.phone}</span></td></tr><tr><td align="center">График работы: ${params.shedule}</td></tr><tr><td align="center"><a href="detail.html">Ссылка на детальную страницу отчётности</a></td></tr></tbody></table>`,
          clusterCaption: name
        }
    }

    addMapPointer(val)
    {
        this.data.feature = {
            type: 'Feature',
            id: this.data.length,
            geometry:{
                type: 'Point',
                coordinates: val.geo
            },
            properties: {
                ...this.getPointData(val)
            },
            options:{
                preset: 'islands#redIcon',
                iconLayout: 'default#image',
                iconImageHref: (val.iconColor === 'Красный')?'/report/bi/dashboard/assets/images/icon.png': '/report/bi/dashboard/assets/images/icon-green.png',
                iconImageSize: [32, 32],
                iconImageOffset: [-10, 0]
            }
        };
    }

    showMapPointers()
    {
        this.objectManager.add(this.data.features);
    }

    setCenter(geo)
    {
        this.map.setCenter(geo);
    }

    setZoom(num)
    {
        this.map.setZoom(num);
    }

    



    async _setRegions(){
        let newCollection = new FeatureCollection(),
            objectManager = new ymaps.ObjectManager(),
            requiredRegions = [],
            _this = this,
            checkRegion= function (event) {
                let target = event._sourceEvent.originalEvent.objectId,
                    region;
            
                Regions.forEach(function (regionExist) {
                  if (target === regionExist.code) {
                    region = regionExist;
                  }
                });
            
                document.querySelector('.nav-list .active').classList.remove('active');
                document.querySelector('.ymaps-2-1-74-areas-pane').style.display = 'none';
                _this.setCenter(eval(region.coord));
                _this.setZoom(region.zoom);
            };
        let geojson = await ymaps.borders.load('RU');
        geojson.features.forEach(function (region) {
            Regions.forEach(function (el) {
                if (region.properties.name === el.city) {
                region.properties.hintContent = el.hint
                region.id = region.properties.iso3166
                region.options = {
                    fillOpacity: 1.0,
                    strokeColor: '#FFF',
                    fillColor: el.color,
                    strokeOpacity: 0.5
                };
                requiredRegions.push(region);
                }
            });
        });
        newCollection.addCollection(requiredRegions);
        objectManager.add(newCollection.features);
        objectManager.objects.events.add(['click'], checkRegion);
        this.map.geoObjects.add(objectManager);
        this.regions = {
            collection: newCollection,
            objectManager: objectManager,
            visibility : true
        };
    }

}