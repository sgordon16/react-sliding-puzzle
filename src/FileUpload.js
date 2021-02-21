import '@fortawesome/fontawesome-free/js/all.js';
const React = require('react')
class Upload extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      fileName: 'No file chosen'
    }
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(event) {
    this.props.setBgImage(URL.createObjectURL(event.target.files[0]))
    //event.target.textContent = event.target.files[0].name
    this.setState({
      fileName: event.target.files[0].name
    })
  }
  render() {
    return (
      <div className="fileUpload">
        <input type="file" id="actual-btn" accept="image/png, image/jpeg" onChange={this.handleChange} hidden/>
        <label for="actual-btn"><i class="fas fa-upload"></i></label>
        <span id="file-chosen">{this.state.fileName}</span>
        {/* <img src={this.state.file} style={{width: '50px', height: '50px'}}/> */}
      </div>
    );
  }
}
export default Upload