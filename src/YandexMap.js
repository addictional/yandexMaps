import FeatureCollection from './FeaturesCollection';
import Regions from './regions'

export default class YandexMap {
    constructor(){
        this.map = null;
        this.objectManager = null;
        this.data = new FeatureCollection();
    }


    setCenter(){

    }

    async init()
    {
        if(await ymaps.ready())
        {
            this._initMap();
            this._initCluster();
            await this._setRegions();
            return true
        }
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
            // clusterize: true,

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
            neededRegions = [],
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
                    neededRegions.push(region);
                }
            });
        });
        newCollection.addCollection(neededRegions);
        this.objectManager.add(newCollection.features);
        this.objectManager.objects.events.add(['click'], checkRegion)
    }

}