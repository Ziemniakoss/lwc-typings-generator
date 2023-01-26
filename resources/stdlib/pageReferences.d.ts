declare namespace lightning.navigation {
	interface AppTypePageReference {
		type: "standard__app";
		attributes: {
			appTarget: Salesforce.ApplicationApiName;
			pageRef?: BasePageReference;
		};
	}

	/**
	 * A page that interacts with an external record.
	 * Currently supports CMS Connect pages.
	 */
	interface ExternalRecordPageType {
		type: "comm__externalRecordPage";
		attributes: {
			recordId: string;
			objectType: "cms"; // TODO add better explanation
			objectInfo;
		};
	}

	interface NavigationItemPageReference {
		type: "standard__navItemPage";
		attributes: {
			apiName: Salesforce.TabApiName;
		};
	}

	/**
	 * A page that interacts with an external relationship on a particular record in the org.
	 * Currently only supports Quip Related List page.
	 */
	interface ExternalRecordRelationshipPageType {
		type: "comm__externalRecordRelationshipPage";
		attributes: {
			recordId: apex.Id;
			objectType: "quip"; //TODO exmplanation why only this value
		};
	}
	interface KnowledgeArticlePageType {
		type: "standard__knowledgeArticlePage";
		attributes: {
			articleType: string;
			urlName: string;
		};
	}

	/**
	 * A page for authentication into an Experience Builder site.
	 */
	interface LoginPageType {
		type: "comm__loginPage";
		attributes: {
			actionName: "login" | "logout";
		};
	}

	/**
	 * A CMS content page in an Experience Builder site with a unique name.
	 */
	interface ManagedContentPageType {
		type: "standard__managedContentPage";
		attributes: {
			contentTypeName: string;
			contentKey: string;
		};
	}

	interface NamedPageInExperienceBuilderType {
		type: "comm__namedPage";
		attributes: {
			name:
				| "Home"
				| "Account Management"
				| "Contact Support"
				| "Error"
				| "Login"
				| "My Account"
				| "Top Articles"
				| "Topic Catalog"
				| "Custom Page";
		};
	}

	/**
	 * A standard page with a unique name.
	 * If an error occurs, the error view loads and the URL isn’t updated.
	 */
	interface StandardNamedPageType {
		type: "standard__namedPage";
		attributes: {
			pageName: "home" | "chatter" | "today" | "dataAssessment" | "filePreview";
		};
		/**
		 * Only applicable when pageName is filePreview.
		 * See [offical docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_open_files)
		 */
		state?: {
			recordIds: string;
			selectedRecordId: string;
		};
	}

	//TODO Navigation Item Page Type

	interface ObjectPageTypePageReference {
		type: "standard__objectPage";
		attributes: {
			objectApiName: schema.SObjectApiName;
			actionName: "home" | "list" | "new";
		};
		state?: {
			filterName?: "Recent" | string;
			/**
			 * Example
			 * ```
			 *defaultFieldValues = 'AccountNumber=ACXXXX,CustomCheckbox__c=true,Name=Salesforce%2C%20%231%3DCRM,NumberOfEmployees=35000,OwnerId=005XXXXXXXXXXXXXXX',
			 * ```
			 */
			defaultFieldValues: string;

			nooverride?: "home" | "list" | "new" | "1";
		};
	}

	interface RecordPageTypePageReference {
		type: "standard__recordPage";
		attributes: {
			recordId: apex.Id;
			objectApiName?: schema.SObjectApiName;
			actionName: "view" | "clone" | "edit";
		};
	}

	interface RecordRelationshipPageTypePageReference {
		type: "standard__recordRelationshipPage";
		attributes: {
			actionName: "view";
			objectApiName: schema.SObjectApiName;
			recordId: apex.Id;
			relationshipApiName: string;
		};
	}

	interface WebPageTypePageReference {
		type: "standard__webPage";
		attributes: {
			url: string;
		};
	}

	interface CheckoutPageReference {
		type: "comm__checkoutPage"
	}

	interface PageReferenceTypes {
		comm__externalRecordPage: ExternalRecordPageType;
		comm__externalRecordRelationshipPage: ExternalRecordRelationshipPageType;
		comm__loginPage: LoginPageType;
		comm__namedPage: NamedPageInExperienceBuilderType;
		standard__app: AppTypePageReference;
		standard__knowledgeArticlePage: KnowledgeArticlePageType;
		standard__managedContentPage: ManagedContentPageType;
		standard__namedPage: StandardNamedPageType;
		standard__navItemPage: NavigationItemPageReference;
		standard__objectPage: ObjectPageTypePageReference;
		standard__recordPage: RecordPageTypePageReference;
		standard__recordRelationshipPage: RecordRelationshipPageTypePageReference;
		standard__webPage: WebPageTypePageReference;

		comm__checkoutPage:CheckoutPageReference
	}

	type PageReference = ValueOf<PageReferenceTypes>;
}
type ValueOf<T> = T[keyof T];
