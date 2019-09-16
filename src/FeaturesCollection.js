export default class FeatureCollection {
    constructor(){
        this.type = "FeatureCollection";
        this.__features =  [];
    }

    set feature(val){
        this.__features.push(val);
    }

    get features(){
        return {type: this.type,features :  JSON.parse(JSON.stringify(this.__features))};
    }
    get length(){
        return this.__features.length;
    }

    addCollection(arr)
    {
        this.__features = arr
    }
    
    clearFeatures(){
        this.__features = [];
    }
};