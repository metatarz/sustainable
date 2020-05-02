export class DataLog{
    _dataLog={} as SA.DataLog.Format

    get dataLog(){
        return this._dataLog
    }

    set dataLog(data){
       this._dataLog=data
    }

}