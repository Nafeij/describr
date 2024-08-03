export enum ActivityAction {
  MAIN = 'android.intent.action.MAIN',
  VIEW = 'android.intent.action.VIEW',
  GET_CONTENT = 'android.intent.action.GET_CONTENT',
}

export type Intent = {
  action: ActivityAction;
  uri?: string;
  categories: string[];
  data?: string;
  type?: string;
  flags?: number;
  extras?: Record<string, any>;
};

export type ResultOptions = {
  isOK?: boolean;
  action?: string;
  uris?: string[];
};
