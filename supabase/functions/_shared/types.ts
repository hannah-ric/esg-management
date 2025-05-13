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
  extractText?: boolean;
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
  rawContent?: string;
  html?: string;
}

export interface ESGDataPoint {
  id?: string;
  resource_id: string;
  metric_id: string;
  value: string;
  context?: string;
  confidence: number;
  source: string;
  framework_id?: string;
  disclosure_id?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  is_edited?: boolean;
}

export interface ESGFrameworkMapping {
  id?: string;
  resource_id: string;
  framework_id: string;
  disclosure_id: string;
  created_at: string;
  updated_at?: string;
}
