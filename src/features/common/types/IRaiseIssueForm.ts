interface IRaiseIssueForm {
  ID: number;
  LOCN_NAME: string;
  LOCN_ID: number;
  COMPANY_NAME: string;
  FILE: null;
  RAISER_EMAIL: string;
  FILENAME: string;
  RAISER_NAME: string;
  RAISER_ID: number;
  PROJECT_ID: number;
  MODULE_ID: number;
  CATEGORY_ID: number;
  CONTACT_NO: string;
  ISSUE_SUBJECT: string;
  ISSUE_DESC: string;
}

export default IRaiseIssueForm;
