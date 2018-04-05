var pageData = {
    data: {},
    onLoad: function (e) {
        console.log(e);
        var parsed_params = JSON.parse(e.eventParams);
        var new_marker = {};
        new_marker['markers'] = parsed_params;
        new_marker['longitude'] = parsed_params[0].longitude;
        new_marker['latitude'] = parsed_params[0].latitude;
        this.setData(new_marker);
    }
};
Page(pageData);