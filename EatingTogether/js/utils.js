Date.prototype.Timestamp = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    var h = this.getHours().toString();
    var m = this.getMinutes().toString();
    var s = this.getSeconds().toString();
    var ms = this.getUTCMilliseconds().toString();
    return yyyy+"-"+(mm[1]?mm:"0"+mm[0])+"-"+(dd[1]?dd:"0"+dd[0])+"%20"+(h[1]?h:"0"+h[0])+":"+(m[1]?m:"0"+m[0])+":"+(s[1]?s:"0"+s[0])+"."+ms;
};

$.uniqID = function (separator) {
    var delim = separator || "-";
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4());
};

$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

function Checkin(lat, lng, x, y, url){
    this.lat = lat;
    this.lng = lng;
    this.x = x;
    this.y = y;
    this.url = url;
}

function CheckinList(Checkin){
    if( typeof CheckinList.checkin == 'undefined' ) {
        CheckinList.checkin = [];
    }
    CheckinList.checkin.push(Checkin);
}

