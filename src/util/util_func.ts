export {};

export const noneAreNull = (arr: Array<any>) => arr.filter(el => el == null).length == 0 ? [] : arr.filter(el => el == null);

export const noneAreUndefined = (arr: Object) => Object.values(arr).filter(el => el == undefined).length == 0 ? [] : Object.entries(arr).filter(el => el[1] == undefined).map(e => e[0]);


export const aggregate_objects_by_keys = (arr: Array<any>, aggregate: string, aggregate_root: string)=> {
    let transArray = [];
    arr.forEach(agg=>{
        let interObj = {}
        interObj[aggregate_root] = []
        Object.keys(agg).forEach(k =>{
            if(k.startsWith(aggregate_root)){
                console.log(k);
                interObj[k] = agg[k];
            }else{
                interObj[aggregate_root].push()
            }
        })
    })
}

// Takes in array with aggregate and root fields only, compiles down into single objects of the root
// requires for all aggregate_root columns to have the same prefix 

export const aggregate_by_single_root = (arr: Array<any>, aggregate: string, aggregate_root: string)=> {
    let rootArray: Array<any> = [];

    arr.forEach(agg=>{
        let interObj: Object = {}
        interObj[aggregate] = [{}]

        let ind = rootArray.findIndex(r=> r[aggregate_root +'_id'] == agg[aggregate_root +'_id']);

        if(ind == -1){
          // create new object and pass in values
            Object.keys(agg).forEach(k =>{
              if(k.startsWith(aggregate_root)){
                  interObj[k] = agg[k];
              }else{
                  interObj[aggregate][0][k] = agg[k];
              }
          })
          rootArray.push(interObj)
          return
        }

        // Loop through keys that aren't in aggregate and push to aggregate

        let existingRoot = rootArray[ind];
        existingRoot[aggregate].push({})
        let lastIndex = existingRoot[aggregate].length - 1;
        Object.keys(agg).forEach(k =>{
              if(!k.startsWith(aggregate_root)){
                  existingRoot[aggregate][lastIndex][k] = agg[k]
              }
        })
}) 
  return rootArray
}

export const aggregate_by_single_root_ignore_fields = (arr: Array<any>, aggregate: string, aggregate_root: string, ignore_fields: Array<string>)=> {
    let rootArray: Array<any> = [];

    arr.forEach(agg=>{
        let interObj: Object = {}
        interObj[aggregate] = [{}]

        let ind = rootArray.findIndex(r=> r[aggregate_root +'_id'] == agg[aggregate_root +'_id']);

        if(ind == -1){
          // create new object and pass in values
            Object.keys(agg).forEach(k =>{
              if(ignore_fields.includes(k))
                return

              if(k.startsWith(aggregate_root)){
                  interObj[k] = agg[k];
              }else{
                  interObj[aggregate][0][k] = agg[k];
              }
          })
          rootArray.push(interObj)
          return
        }

        // Loop through keys that aren't in aggregate and push to aggregate

        let existingRoot = rootArray[ind];
        existingRoot[aggregate].push({})
        let lastIndex = existingRoot[aggregate].length - 1;
        Object.keys(agg).forEach(k =>{
            if(ignore_fields.includes(k))
                return
              if(!k.startsWith(aggregate_root)){
                  existingRoot[aggregate][lastIndex][k] = agg[k]
              }
        })
}) 
  return rootArray
}