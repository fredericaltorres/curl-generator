import React, { Component } from 'react';
import Checkbox from '../Checkbox';
import { 
    COMMANDLINES, HTTP_METHODS, HTTP_CONTENT_TYPES,
    CurlGeneratorEngine 
} from './CurlGeneratorEngine';

import './CurlGenerator.css';

const APP_LINKS = {

    "curl website" : "https://curl.haxx.se",
    "curl examples" : "https://www.rosehosting.com/blog/curl-command-examples/"
};

const DEFAULT_STATE = {

    curl_url: "https://mydomain.com/api/endpoint",
    curl_method: "GET",
    curl_body: "{ \"firstName\" : \"Frederic\" }",
    curl_commandLineType : COMMANDLINES.MsDos,
    curl_contentType: HTTP_CONTENT_TYPES.JSON,
    curl_headers: [
        // { name: 'Debug', value:'true' },
    ],
    curl_username: '',
    curl_password: '',
};

class CurlGenerator extends Component {

    state = {...DEFAULT_STATE};

    constructor() {

        super();
    }

    computeCommandLine = () => {
        
        return new CurlGeneratorEngine().computeCommandLine(this.state);
    }

    deleteHeader = (index) => {
        
        let headers = this.state.curl_headers;
        console.log(`deleteHeader:${index}, header:${JSON.stringify(headers[index])} `);
        headers = headers.filter((value, index2) => { return index2 != index; });
        this.updateState('curl_headers', headers);        
    }

    addHeader = () => {
        
        const headers = this.state.curl_headers;        
        headers.push({ name:'', value:''});
        this.updateState('curl_headers', headers);        
    }

    onHeaderNameChange = (index, name) => {

        const headers = this.state.curl_headers;
        headers[index].name = name;
        this.updateState('curl_headers', headers);
    }

    onHeaderValueChange = (index, value) => {

        const headers = this.state.curl_headers;
        headers[index].value = value;
        this.updateState('curl_headers', headers);
    }

    onUsernameChange = (e) => {

        this.updateState('curl_username', e.target.value);
    }

    onPasswordChange = (e) => {

        this.updateState('curl_password', e.target.value);
    }

    onUrlChange = (e) => {

        this.updateState('curl_url', e.target.value.toLocaleLowerCase());
    }

    onBodyChange = (e) => {

        this.updateState('curl_body', e.target.value);
    }

    isBodyTypeJson () {

        return this.state.curl_contentType == HTTP_CONTENT_TYPES.JSON;
    }

    isJsonBodyValid () {

        if(this.isBodyTypeJson()) {

            try {

                JSON.parse(this.state.curl_body);
                return true;
            }
            catch(ex) {
            }
        }

        return false;
    }

    updateState = (property, value) => {

        this.setState({ ...this.state, [property]: value }, () => {
            console.log(`state: ${JSON.stringify(this.state)}`);
        });
    }

    onMethodChange = (e) => {

        this.updateState('curl_method', e.target.value);
    }
        
    copyToOperatingSystemClipboard = (str) => {

        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    clearState = () => {
        
        this.setState({...DEFAULT_STATE});
    }

    onClear = () => {

        this.clearState();
    }

    componentWillMount() {

        this.clearState();
    }

    copyToClipboard = () => {

        this.copyToOperatingSystemClipboard(this.computeCommandLine());
    }
    
    render() {

        var curlLinks = Object.keys(APP_LINKS).map((link) => {

            var href = APP_LINKS[link];
            return <div key={href}><a target="top" href={href}>{link}</a></div>;
        });

        var httpMethodOptions = HTTP_METHODS.map((method) => {

            return <option key={method}>{method}</option>;
        });

        var commandLineRadioButtons = Object.keys(COMMANDLINES).map((cmdLineId) => {

            const cmdValue = COMMANDLINES[cmdLineId];

            return <span key={cmdValue}>&nbsp;
                <Checkbox                                 
                    isRadio={true} isLoading={false} text={cmdLineId}
                    id={cmdValue}
                    checked={this.state.curl_commandLineType === COMMANDLINES[cmdLineId]}
                    onChange={ () => {
                        this.updateState('curl_commandLineType', COMMANDLINES[cmdLineId]);
                    }} 
                /> &nbsp; &nbsp; &nbsp;
            </span>;
        });

        var contentTypeRadioButtons = Object.keys(HTTP_CONTENT_TYPES).map((contentType) => {

            const contentTypeValue = HTTP_CONTENT_TYPES[contentType];

            return <span key={contentTypeValue}>&nbsp;
                <Checkbox                                 
                    isRadio={true} isLoading={false} text={contentType}
                    key={contentTypeValue} id={contentTypeValue}
                    checked={this.state.curl_contentType === contentTypeValue}
                    onChange={ () => {
                        this.updateState('curl_contentType', contentTypeValue);
                    }}
                />    &nbsp; &nbsp; &nbsp;
            </span>;
        });

        var headersFields = this.state.curl_headers.map((header, index) => {

            return <div>                 
                Name:  &nbsp; &nbsp; &nbsp;
                <input  id={`header_name_${index}`} type="text"  value={header.name} 
                    onChange={(e) => {
                        return this.onHeaderNameChange(index, e.target.value);
                    }}
                />
                  &nbsp; &nbsp; &nbsp;

                Value:  &nbsp; &nbsp; &nbsp;
                <input id={`header_value_${index}`} type="text"  value={header.value} 
                    onChange={(e) => {
                        return this.onHeaderValueChange(index, e.target.value);
                    }}
                />
                  &nbsp; &nbsp; &nbsp;
                <button type="button" className="btn btn-primary  btn-sm " onClick={ () => { this.deleteHeader(index); }} > Delete </button>
            </div>;
        });

        return ( 
            <div id="main" role="main">
                <br/>
                <table cellPadding="2" cellSpacing="2">
                    <tbody>
                    <tr>
                        <td>URL:</td>
                        <td><input id="curl_url" ref="curl_url" type="text" className="form-control" value={this.state.curl_url} onChange={this.onUrlChange}  /></td>
                    </tr>
                    <tr>
                        <td>Method:</td>
                        <td>
                            <select className="form-control" onChange={this.onMethodChange} ref="curl_method">
                                {httpMethodOptions}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Body:</td>
                        <td>
                            <textarea id="curl_body" ref="curl_body" type="text" className="form-control" value={this.state.curl_body} onChange={this.onBodyChange} />
                            {this.isBodyTypeJson() && this.isJsonBodyValid() && 
                                <span style={{ padding:'3px' }} className="badge badge-success"> Valid JSON </span>
                            }
                            {this.isBodyTypeJson() && !this.isJsonBodyValid() && 
                                <span className="badge badge-danger"> Invalid JSON </span>
                            }                                                            
                            {!this.isBodyTypeJson() && 
                                <span style={{ padding:'3px' }} > </span>
                            }
                        </td>
                    </tr>                    
                    <tr>
                        <td>Content Type:</td>
                        <td>
                            {contentTypeRadioButtons}
                        </td>
                    </tr>
                    <tr>
                        <td>Headers:</td>
                        <td>
                            {<button type="button" className="btn btn-primary  btn-sm " onClick={this.addHeader} > Add </button>}
                            {headersFields}
                        </td>
                    </tr>                    
                    <tr>
                        <td>Authentication:</td>
                        <td>
                        Username:&nbsp;&nbsp;&nbsp;
                        <input  id="curl_username" type="text"  value={this.state.curl_username} 
                            onChange={this.onUsernameChange}
                        /> 
                        &nbsp;&nbsp;&nbsp;Password:&nbsp;&nbsp;&nbsp;
                        <input  id="curl_password" type="text" value={this.state.curl_password} 
                            onChange={this.onPasswordChange}
                        />
                        </td>
                    </tr>                    
                    <tr>
                        <td>Command Line:</td>
                        <td>                            
                            {commandLineRadioButtons}
                        </td>
                    </tr>                    
                    <tr>
                        <td>Links:</td>
                        <td colSpan="2">                            
                            {curlLinks}
                        </td>
                    </tr>               
                    </tbody>
                </table>    

                <br/>

                Command Line:
                <pre>
                    {this.computeCommandLine()}
                </pre>
                
                <button type="button" className="btn btn-primary  btn-sm " onClick={this.onClear} > Clear </button>
                &nbsp;
                <button type="button" className="btn btn-primary  btn-sm " onClick={this.copyToClipboard} > Copy To Clipboard </button>

            </div>
        );
    }
}

CurlGenerator.defaultProps = {

};

export default CurlGenerator;
