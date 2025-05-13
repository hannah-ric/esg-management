export interface DiffbotAnalyzeResponse {
  request: {
    pageUrl: string;
    api: string;
    version: string;
    humanLanguage: string;
  };
  objects: Array<{
    type: string;
    title: string;
    text?: string;
    html?: string;
    date?: string;
    author?: string;
    tags?: string[];
    categories?: string[];
    sentiment?: number;
    [key: string]: any;
  }>;
}

export interface AnalyzeUrlRequest {
  url: string;
  mode?: string;
}

export interface ESGResource {
  title: string;
  url: string;
  type: string;
  category: string;
  description: string;
  date: string;
  source: string;
  tags?: string[];
  fileType: string;
}
