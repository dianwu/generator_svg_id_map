import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      draging: false, 
      svg_list: [],
      element_map:{},
      model_name:''
    };
    window.addEventListener('drop', (e) => {e.preventDefault()});
  }

  svg_id_cnt = 0
  svg_map = {}

  get_svg_id(){
    return 'svg_'+(++this.svg_id_cnt);
  }

  read_svg_content(file_id, file){
    let reader = new FileReader();
    let app = this;
    reader.onload = function(e) {
      // var rawData = reader.result;
      // console.log('reader.result',reader.result);
      let parser = new DOMParser();
      let doc = parser.parseFromString(reader.result, "image/svg+xml");
      app.svg_map[file_id].svg = doc;
      app.update_json_text();
      // console.log('reader.doc', doc.querySelectorAll('*'));
    }

    reader.readAsBinaryString(file);
  }

  update_json_text(){
    let svg_map = this.svg_map;
    let element_map = {};
    Object.keys(svg_map).forEach( (file_id) => {
      let {svg, svg_post_fix} = svg_map[file_id];
      if (!svg){
        return true;
      }
      // console.log('svg',svg)
      let elements = svg.querySelectorAll('*');
      Array.prototype.forEach.call(elements, function (element) {
        console.log('svg element',element_map, element.id, svg_post_fix)
        element_map[element.id] = svg_post_fix;
      });
      
      // svg.querySelectorAll('*');
      
      // do something with obj
    });
    this.setState({element_map:JSON.stringify(element_map, null, ' ')});
    // function* entries(obj) {
    //    for (let key of Object.keys(obj)) {
    //      yield [key, obj[key]];
    //    }
    // }

    // // an alternative version using a generator expression
    // function entries(obj) {
    //    return (for (key of Object.keys(obj)) [key, obj[key]]);
    // }

    // for (let [key, value] of entries(myObj)) {
    //    // do something with key|value
    // }
  }

  sty_getLeftBodySty(){
    var style = {};
    // console.log('this.state.draging',this.state.draging)
    if (this.state.draging){
      style.border = 'dashed';
    }
    return style;
  }

  e_dropFile(e) {
    e.preventDefault();
    let list = [];
    let app = this;
    let state = app.state;
    try{
      Array.prototype.slice.call(e.dataTransfer.files, 0).map((file, index) => {
        console.log('file', file)
        let file_id = app.get_svg_id();
        let model_name = '';
        let file_name = file.name;
        let svg_post_fix = '';
        if (/\.svg$/i.test(file_name)) {
          model_name = file.name.replace(/(.*)_\d\.svg/, '$1');
          svg_post_fix = file_name.match(/(.*)_(\d*)\.svg/)[2];
          console.log('model_name',app.state.model_name, model_name);
          if (app.state.model_name === '') {
            app.setState({
              model_name: model_name
            });
          } else if (app.state.model_name !== model_name) {
            throw "model name conflict"
          }

          list.push({
            file_id: file_id,
            name: file.name,
            file: file,
            svg_post_fix: svg_post_fix
          });
          app.svg_map[file_id] = {svg_post_fix: svg_post_fix};
          app.read_svg_content(file_id, file);
        }
      });
    }catch(e){
      console.log(e);
    }
    

    this.setState({svg_list : this.state.svg_list.concat(list)});
    // console.log('event.dataTransfer.files', this.state, list);
    this.setState({draging : false});
  }

  e_dragLeave(e){
    e.preventDefault();
    this.setState({draging : false});
  }

  e_dragOver(e){
    e.preventDefault();
    this.setState({draging : true});
    e.dataTransfer.dropEffect = 'copy';
  }

  e_download(){
    let element = document.createElement('a');
    element.setAttribute('href', 'data:japplication/json;charset=utf-8,' + encodeURIComponent(this.state.element_map));
    element.setAttribute('download', this.state.model_name+'.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  render() {
    return (
      <div className = "App">
        <div className = "App-header">
          <h2>Generator SVG Element ID Map</h2>
        </div>
        <div className = "App-body">
          <div className = "App-body-left SVG-file-list"
            style={this.sty_getLeftBodySty()}
            onDrop = {(e) => this.e_dropFile(e) }
            onDragLeave = {(e) => this.e_dragLeave(e)}
            onDragOver = {(e) => this.e_dragOver(e)}
            >
            Drop svg files here.
            <div>
            <ul>
            {
              this.state.svg_list.map(function(item, key) {
                return <li style={{textAlign: 'left'}} data-file_id={item.file_id} ><input type="checkbox"/>{item.name}</li>
              })
            }
            </ul>
          {this.state.modal}
        </div>
      </div>
      <div className="App-body-right map-result">
        <button
            className=""
            style= {{
              display:'block', 
              width:'100%',
              fontSize:'14px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => this.e_download(e)}
          >Download</button><textarea 
            style= {{
              display:'block', 
              width:'100%',
              fontSize:'14px',
              minHeight:'300px',
              boxSizing: 'border-box'
            }}
            className="" readOnly value={this.state.element_map} ></textarea></div>
        </div>
      </div>
    );
  }
}

export default App;
