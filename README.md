# angular-instagram-tag-media
An AngularJs directive to get and show, with your custom layout, a list of recently Instagram tagged media.

<br/>
With this directive you can consume the data requested to the Instagram server with an hashtag.

```javascript
 <ng-dv-instagram-tag-media
        tag-name="myHashTag"
        client-id="myClientId"
        reload-ms="60000"
        slide-ms="auto">
        
    <!--put here your data presentation-->
    
</ng-dv-instagram-tag-media>
```

# How to use
<h5>isolatd scope data</h5>
  attr name   |     type        |   description    
--------------| ----------------|-------------------------------------------------------------------
tagName       | one-way binding | hashtag of media pics
clientId      | one-way binding | Instagram app CLIENT ID (see https://instagram.com/developer/)
reloadMs      | one-way binding | Milliseconds for reloading data from the server
slideMs       | one-way binding | Milliseconds to activare a slider images service. Use "auto" to implement an auto calculation interval.
instagramData | two-way binding | Set here your data source  for the response body

<h5>events</h5>
  event name                        |     data        |   description    
------------------------------------| ----------------|-------------------------------------------------------------------
ngDvInstagramTagMedia_DataChanged   |     ***         | it will be raised when your data source changes, generally if the the success promise method will be invoked.
ngDvInstagramTagMedia_DataWillLoad  |     ***         | it will be raised before sending a request to the server.
ngDvInstagramTagMedia_DataDidLoad   | instagram_data  | it will be raised after sending a request to the server and if the the success promise method will be invoked
ngDvInstagramTagMedia_NextItem      | custom_data     | it will be raised after slideMs milliseconds.

- instagram_data= see https://instagram.com/developer/endpoints/tags/
- custom_data is an object with this structure:
var custom_data={
  item: item of the instagram data array,
  totalItems: length of instagram data array,
  currentIndex:_currentSlideIndex,
  imageUrl: .images.low_resolution.url of an item of the instagram data array,
};

<br/>
![ScreenShot](https://raw.github.com/alchimya/angular-instagram-tag-media/master/screenshots/angular-instagram-tag-media.gif)

Examples:
- slide presentation
```javascript
  <ng-dv-instagram-tag-media
        tag-name={{hashtag}}
        client-id="{{ClientId}}"
        reload-ms="60000"
        slide-ms="auto">
  
    <!--data presentation-->
    <div>
        <img ng-src="{{lastImageUrl}}" style="border-style: solid;border-width: 2px"/>
        <div>
            <span>{{pageOf}}</span>
        </div>
    </div>
  </ng-dv-instagram-tag-media>
```

- simple data list presentation
```javascript

 <ng-dv-instagram-tag-media
      tag-name={{hashtag}}
      client-id="{{ClientId}}"
      reload-ms="60000"
      instagram-data="instagramJSON">
      <!--data presentation-->
      <table>
          <thead>
          <tr>
              <th>low_resolution</th>
              <th>standard_resolution</th>
              <th>latitude</th>
              <th>ongitude</th>
              <th>likes</th>
          </tr>
          </thead>
          <tbody>
          <tr ng-repeat="item in instagramJSON.data">
              <td>
                  <a href="{{item.images.low_resolution.url}}" target="_blank">{{item.images.low_resolution.url}}</a>
              </td>
              <td>
                  <a href="{{item.images.standard_resolution.url}}" target="_blank">{{item.images.standard_resolution.url}}</a>
              </td>
              <td>
                  {{item.location.latitude}}
              </td>
              <td>
                  {{item.location.longitude}}
              </td>
              <td>
                  {{item.likes.count}}
              </td>
          </tr>
          </tbody>
      </table>

    </ng-dv-instagram-tag-media>

```
