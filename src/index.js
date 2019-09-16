import YandexMap from './YandexMap';

const Map = new YandexMap();


(async function (){
    /* Обработчики для центровки и изменения зума по клику на кнопки "Москва" и "Россия" */
     function zoomButtons(){
        let zoomButtons = document.querySelectorAll('.zoom-filter a')
        zoomButtons.forEach(function (elem) {
                elem.addEventListener(
                    'click',
                    function (event) {
                        event.preventDefault()
                        var parentListItem = this.parentNode
            
                        if (parentListItem.classList.contains('active')) return
            
                        if (document.querySelector('.nav-list .active') !== null) { document.querySelector('.nav-list .active').classList.remove('active') }
            
                        parentListItem.classList.add('active')
                        if (this.dataset.zoom === '10') {
                        document.querySelector('.ymaps-2-1-74-areas-pane').style.display =
                            'none'
                        } else {
                        document.querySelector('.ymaps-2-1-74-areas-pane').style.display =
                            'block'
                        }
            
                        Map.setCenter(eval(this.dataset.coord))
                        Map.setZoom(this.dataset.zoom)
                    },
                    false
                )
        }, false)
    };
    function checkRegion (event) {
        let target = event._sourceEvent.originalEvent.objectId,
            region;
    
        Regions.forEach(function (regionExist) {
          if (target === regionExist.code) {
            region = regionExist;
          }
        });
    
        document.querySelector('.nav-list .active').classList.remove('active');
        document.querySelector('.ymaps-2-1-74-areas-pane').style.display = 'none';
        Map.setCenter(eval(region.coord));
        Map.setZoom(region.zoom);
    }
    let data = await $.ajax({
        url:'/report/bi/dashboard/ajax.php',
        data : {
            method: 'getStores'
        },
        dataType:'json'
    });

    await Map.init()
    // data = JSON.parse(data.response);
    data.forEach(element => {
        if(element.geo.length > 1)
            Map.addMapPointer(element);
    });
    Map.showMapPointers();
    zoomButtons();
    
}(Map));
