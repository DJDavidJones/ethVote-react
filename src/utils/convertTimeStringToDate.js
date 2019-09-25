// https://stackoverflow.com/questions/20294308/convert-dd-mm-yyyy-hrminsec-to-unixtime
export default function(time) {
    var year = time.match(/\d\d\d\d/)[0];
    var month = time.match(/.(\d\d)./)[1] - 1;
    var day = time.match(/^\d\d/)[0];
    var hour = time.match(/\s\d\d/)[0];
    var minute = time.match(/:(\d\d)/)[1];
    return Math.round(
        new Date(year, month, day, hour, minute).getTime() / 1000
    );
}
