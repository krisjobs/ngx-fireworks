import * as dayjs from "dayjs";

// ===================== navigateTo =====================

Cypress.Commands.add("navigateTo", { prevSubject: 'optional' }, (subject, {
  moduleId,
  sectionId,
  tabIdx,
  targetUrl,
}) => {
  cy.log(`navigateTo -> ${targetUrl}`);

  cy
    .clickElement({
      cyData: 'app.main.toolbar.buttonOpenNavbar'
    })
    .clickElement({
      cyData: `app.main.sidenav.linkModule.${moduleId}`
    })
    .clickElement({
      cyData: `module.home.sidenav.linkSection.${sectionId}`
    });

  cy
    .url()
    .should('include', targetUrl);
});

// ===================== getUrl =====================

Cypress.Commands.add("getUrl", { prevSubject: 'optional' }, (subject) => {
  cy.log('getUrl');

  return cy.url()
    .then(
      (url) => {
        sessionStorage.setItem('currentUrl', url);

        return url;
      }
    );
});

// ===================== checkUrl =====================

Cypress.Commands.add("checkUrl", { prevSubject: 'optional' }, (subject, targetUrl) => {
  cy.log('checkUrl');

  cy.url()
    .should('include', targetUrl);
});
// ===================== openMenu =====================

Cypress.Commands.add("openMenu", { prevSubject: 'optional' }, (subject, {
  actionsType,
  entityId,
  viewType = 'grid',
}) => {
  cy.log(`openMenu -> ${actionsType}`);

  cy.setViewType(viewType);

  switch (actionsType) {
    case 'collection':
      cy.clickElement({
        cyData: 'module.home.toolbar.buttonCollectionActions'
      });
      break;
    case 'document':
      switch (viewType) {
        case 'grid':
          cy.clickElement({
            cyData: `module.overview.grid.card.buttonDocumentActions.${entityId}`,
            clickPosition: 'top',
          });
          break;
        case 'table':
          cy.clickElement({
            cyData: `module.overview.table.buttonDocumentActions.${entityId}`,
          });
          break;
        default:
        // undefined -> do nothing
      }
      break;
    case 'sort':
      cy.clickElement({
        cyData: 'module.home.toolbar.buttonSortMenu'
      });
      break;
    case 'view':
      cy.clickElement({
        cyData: 'module.home.toolbar.buttonViewMenu'
      });
      break;
  }
});

// ===================== closeMenu =====================

Cypress.Commands.add("closeMenu", { prevSubject: 'optional' }, (subject) => {
  cy.log('closeMenu');

  cy.get('body').click(0, 0); // just click away to close context menu
});

// ===================== closeNotification =====================

Cypress.Commands.add("closeNotification", { prevSubject: 'optional' }, (subject) => {
  cy.log('closeNotification');

  cy.get('snack-bar-container')
    .contains('OK') // OK is success action button text
    .click();
});

// ===================== clearFilters =====================

Cypress.Commands.add("clearFilters", { prevSubject: 'optional' }, (subject) => {
  cy.log('clearFilters');

  cy.clickElement({
    cyData: 'module.home.toolbar.buttonClearFilters'
  });
});

// ===================== setPageSize =====================

Cypress.Commands.add("setFilters", { prevSubject: 'optional' }, (subject, filters) => {
  cy.log(`setFilters`);

  cy.clickElement({
    cyData: 'module.home.toolbar.buttonFiltersMenu'
  });

  filters.forEach(
    (filter) => {
      const cyData = `module.home.toolbar.filters.${filter.type}Field.${filter.name}`;
      if (filter.type === 'input') {
        cy.typeText({
          cyData,
          insertValue: filter.value,
        });
      } else { // filter.type === 'select'
        cy.selectOption({
          cyData,
          testData: filter.value,
        });
      }
    }
  );

  cy.wait(500); // account for debounceTime in app (also 500ms)

  cy.closeMenu();
});

// ===================== setPageSize =====================

Cypress.Commands.add("setPageSize", { prevSubject: 'optional' }, (subject, pageSize) => {
  cy.get('mat-paginator', { log: false })
    .find('mat-form-field', { log: false })
    .then(
      (element) => {
        if (!element[0].innerHTML.includes(pageSize.toString())) {
          cy.log(`setPageSize -> ${pageSize}`);

          cy.wrap(element, { log: false })
            .click();

          cy.get('mat-option')
            .contains(pageSize)
            .click();
        }
      }
    )
});

// ===================== setViewType =====================

Cypress.Commands.add("setViewType", { prevSubject: 'optional' }, (subject, viewType) => {
  cy.get('mat-button-toggle', { log: false })
    .first({ log: false })
    .then((button) => {
      const isTableView = button.hasClass('mat-button-toggle-checked');

      switch (viewType) {
        case 'grid':
          if (isTableView) {
            cy.log(`setViewType -> ${viewType}`);

            cy.clickElement({
              cyData: 'module.home.toolbar.buttonGridView'
            });
          }
          break;
        case 'table':
          if (!isTableView) {
            cy.log(`setViewType -> ${viewType}`);

            cy.clickElement({
              cyData: 'module.home.toolbar.buttonTableView',
            });
          }
          break;
        default:
        // undefined -> do nothing, no problem
      }
    });
});

// ===================== setTimestamp =====================

Cypress.Commands.add("setTimestamp", { prevSubject: 'optional' }, (subject, stop?) => {
  sessionStorage.setItem(`timestamp${!stop ? 'Start' : 'Stop'}`, dayjs().valueOf().toString());
});

// ===================== changeSorting =====================
Cypress.Commands.add("changeSorting", { prevSubject: 'optional' }, (subject, sortingType) => {
  cy.openMenu({ actionsType: 'sort' });

  switch (sortingType) {
    case 'neutral':
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      break;
    case 'ascending':
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      break;
    case 'descending':
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      cy.clickElement({
        cyData: 'app.lib.menu.buttonAction.most-recent'
      });
      break;
  }
  cy.closeMenu();
});