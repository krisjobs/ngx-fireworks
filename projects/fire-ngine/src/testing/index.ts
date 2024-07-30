export {}

declare global {
  namespace Cypress {
    interface ResolvedConfigOptions {
      hideXHRInCommandLog?: boolean;
    }

    interface Chainable {
      // ==========================================
      // ===================== APP =====================
      // ==========================================

      /**
       * Compound command that can get you anywhere in the app
       */
      navigateTo(options: Partial<NavigationOptions>): Chainable<any>;

      /**
       * stores the current url in session storage
       */
      getUrl(): Chainable<any>;

      /**
       * simply verifies that a router transition is complete
       */
      checkUrl(targetUrl: string): Chainable<any>;

      /**
       * Just open a particular actions menu (used in checkActions and invokeAction)
       */
      openMenu(options: Partial<MenuOptions>): Chainable<any>;

      /**
       * Helper command to click away, in order to close a context menu
       */
      closeMenu(): Chainable<any>;

      /**
       * Helper command to close a success notification (snack-bar)
       */
      closeNotification(): Chainable<any>;

      /**
       * Remove currently active filters by pressing the red button
       */
      clearFilters(): Chainable<any>;

      /**
       * Set filters
       */
      setFilters(filters: TestFilter[]): Chainable<any>;

      /**
       * Set page size by triggering the paginator dropdown
       */
      setPageSize(pageSize: number): Chainable<any>;

      /**
       * Set view type by using the dedicated toolbar control
       */
      setViewType(viewType?: ViewType): Chainable<any>;

      /**
       * Sets the sorting by which entities are displayed ('descending'|'ascending'|'neutral')
       */
      changeSorting(sortingType?: SortingType): Chainable<any>;

      /**
       * Sets timestamps that help verify when actions took place in the db
       */
      setTimestamp(stop?: boolean): Chainable<any>;


      // ==========================================
      // ===================== DATA =====================
      // ==========================================

      /**
       * Click an element on the frontend and check context
       */
      clickElement(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Check the contents of an element on the frontend without interaction
       */
      checkElement(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Types text in an input element or a text area
       */
      typeText(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Select option from a dropdown element
       * 1) select by display text [options.containsText]
       * 2) select by display text [options.containsText] and check stored value [options.testData]
       * 3) select by stored value [options.testData]
       */
      selectOption(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Pick date from a date picker element
       */
      pickDate(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Upload file to a dropzone element
       */
      uploadFile(options: Partial<DataOptions>): Chainable<any>;

      /**
       * TODO chip input is still under development
       */
      addChip(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Gets a property of a given element
       */
      getProperty(options: Partial<DataOptions>): Chainable<any>;

      // ==========================================
      // ===================== ENTITY =====================
      // ==========================================

      /**
       * Complete form interaction on create/edit entity
       */
      saveEntity(options: Partial<FormOptions>): Chainable<any>;

      /**
       * Complete form interaction on remove/archive entity
       */
      removeEntity(options: Partial<FormOptions>): Chainable<any>;

      /**
       * Check query result displayed on the frontend
       *
       * returns all query elements
       */
      checkEntities(options: Partial<DataOptions>): Chainable<any>;

      /**
       * Invoke a particular action from its corersponding menu
       */
      invokeAction(options: Partial<MenuOptions>): Chainable<any>;

      /**
       * Check actions and their state in a particular menu
       */
      checkActions(options: Partial<MenuOptions>): Chainable<any>;

      /**
       * Check a table row to verify it displays data correctly
       */
      checkTable(options: Partial<EntityOptions>): Chainable<any>;

      /**
       * Check a grid card to verify it displays data correctly
       */
      checkGrid(options: Partial<EntityOptions>): Chainable<any>;

      // ==========================================
      // ===================== FIREBASE =====================
      // ==========================================

      /**
       * Initialization procedure for firebase auth/firebase/storage
       * Call within the before-hook
       */
      initFirebase(): any;

      /**
       * Get a document directly from the database to check content
       */
      getDocument(options: Partial<FirebaseOptions>): Chainable<any>;

      /**
       * Checks a particular document from the database for equality
       */
      checkDocument(options: Partial<FirebaseOptions>): Chainable<any>;

      /**
       * Get all documents in a collection directly from the database to check content
       */
      getCollection(options: Partial<FirebaseOptions>): Chainable<any>;

      /**
       * Checks collection size and stores it for further checks
       */
      checkCollection(options: Partial<FirebaseOptions>): Chainable<any>;

      /**
       * Lists all files and folders within a specific path
       */
      getStorageListings(options: Partial<FirebaseOptions>): Chainable<string[]>;

      /**
       * Gets the url of a file stored in Firebase storage
       */
      getStorageUrl(options: Partial<FirebaseOptions>): Chainable<any>;

      /**
       * Utility function that checks the firebase storage download link
       */
      checkFileUrl(options: Partial<FirebaseOptions>): Chainable<any>;


      // ==========================================
      // ===================== USER =====================
      // ==========================================

      /**
       * Programatic firebase auth user sign-in
       * Call within the before-hook
       * @param email
       * @param password
       */
      loginUser(email?: string, password?: string): void;
    }
  }
}


// ! COPY THIS IN e2e.ts

// * hide XHR requests from command log to keep it clean
if (Cypress.config('hideXHRInCommandLog')) {
  const app = window.top;
  if (
    app &&
    !app.document.head.querySelector('[data-hide-command-log-request]')
  ) {
    const style = app.document.createElement('style');
    style.innerHTML =
      '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');

    app.document.head.appendChild(style);
  }
}
