export const COMMANDLINES = {

    MsDos : "MsDos",
    Powershell : "Powershell",
    Linux : "Linux",
};

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATH"];

export const HTTP_CONTENT_TYPES = {
    
    JSON : "application/json",
    XML : "text/xml",
    "Form Encoded" : "application/x-www-form-urlencoded"
};


export class CurlGeneratorEngine {

    isPutOrPostHttpMethod () {

        return this.state.curl_method === "PUT" || this.state.curl_method === "POST";
    }

    getCurlProgramForCommandLine() {

        switch(this.state.curl_commandLineType) {

            case COMMANDLINES.MsDos : 
            case COMMANDLINES.Powershell : return `curl.exe`;
            case COMMANDLINES.Linux :  return `curl`;
            default: throw `Command line type:${this.state.curl_commandLineType} not supportted`;
        }
    }

    getBodyMainQuoteForCommandLine(body) {

        switch(this.state.curl_commandLineType) {

            case COMMANDLINES.MsDos : return `"`;
            case COMMANDLINES.Powershell : return `"`;
            case COMMANDLINES.Linux :  return `'`;
        }        

        return body;
    }

    getHeaderQuoteForCommandLine() {

        return `"`;
    }    
    
    prepareBodyForCommandLine(body) {

        if(this.state.curl_contentType === HTTP_CONTENT_TYPES.JSON ||
           this.state.curl_contentType === HTTP_CONTENT_TYPES.XML ) {

            switch(this.state.curl_commandLineType) {

                case COMMANDLINES.MsDos : 
                    body = body.replace(/"/g, '`');
                    body = body.replace(/`/g, '""');
                break;
                case COMMANDLINES.Powershell : 
                    body = body.replace(/"/g, '`');
                    body = body.replace(/`/g, '`"`"');
                break;
                case COMMANDLINES.Linux : break;
            }
        }

        return body;
    }

    computeCommandLine = (state) => {

        this.state = state;
        const body = this.state.curl_body;
        const bodyMainQuote = this.getBodyMainQuoteForCommandLine(body);
        const headerMainQuote = this.getHeaderQuoteForCommandLine();

        let cmd = `${this.getCurlProgramForCommandLine()}`;
        cmd += ` -X ${this.state.curl_method}`;

        if(this.isPutOrPostHttpMethod()) {

            cmd += ` -H ${headerMainQuote}Content-type: ${this.state.curl_contentType}${headerMainQuote}`;
        }

        if(this.state.curl_username && this.state.curl_password) {

            cmd += ` -u ${headerMainQuote}${this.state.curl_username}:${this.state.curl_password}${headerMainQuote}`;
        }

        this.state.curl_headers.forEach((header) => {

            if(header.name && header.value) {

                cmd += ` -H ${headerMainQuote}${header.name}: ${header.value}${headerMainQuote}`;
            }
        });

        cmd += ` -d ${bodyMainQuote}${this.prepareBodyForCommandLine(body)}${bodyMainQuote} `;
        cmd += ` ${this.state.curl_url}`;

        return cmd;
    }
}
