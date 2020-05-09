export const performance = {
    now: function(start?:[number,number] | undefined):[number,number] | number {
        if ( !start ) return process.hrtime();
        var end = process.hrtime(start);
        return Math.round((end[0]*1000) + (end[1]/1000000));
    }
}