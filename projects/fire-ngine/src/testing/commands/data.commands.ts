// ===================== clickElement =====================

Cypress.Commands.add("clickElement", { prevSubject: 'optional' }, (subject, {
  cyData,
  testData,
  containsText,
  isChecked,
  clickPosition = 'center',
}) => {
  cy.log('clickElement');

  cy.get(`[data-cy="${cyData}"]`)
    .click(clickPosition)
    .then(
      (element) => {
        if (testData) {
          expect(element).to.have.attr('data-test', testData);
        }

        if (containsText) {
          expect(element).to.contain(containsText);
        }

        // * Causing problem when creating/copying orders (orderPlaced)
        if (isChecked != undefined) {
          isChecked ?
            expect(element).to.have.class('mat-checked') :
            expect(element).to.not.have.class('mat-checked');
        }
      }
    );
});

// ===================== typeText =====================

Cypress.Commands.add("typeText", { prevSubject: 'optional' }, (subject, {
  cyData,
  insertValue,
  isInvalid: checkInvalid,
}) => {
  cy.log('typeText');

  cy.get(`[data-cy="${cyData}"]`)
    .clear()
    .type(`${insertValue}`)
    .then(
      (element) => {
        if (checkInvalid) {
          expect(element).to.have.class('ng-invalid')
        }
      }
    );
});

// ===================== selectOption =====================

Cypress.Commands.add("selectOption", { prevSubject: 'optional' }, (subject, {
  cyData,
  testData,
  containsText,
}) => {
  cy.log('selectOption');

  // ! cy.select does not work with mat-select
  cy.get(`[data-cy="${cyData}"]`)
    .click()
    .get('mat-option')
    .then(
      (elements) => {
        if (!!containsText) {
          cy.wrap(elements)
            .contains(containsText)
            .then(
              (element) => {
                if (!!testData) {
                  expect(element).to.have.attr('data-test', testData);
                }

                cy.wrap(element)
                  .click();
              }
            )
        } else {
          cy.wrap(elements)
            .find(`[data-test="${testData}"]`)
            .click();
        }
      }
    );
});

// ===================== pickDate =====================

Cypress.Commands.add("pickDate", { prevSubject: 'optional' }, (subject, {
  cyData,
}) => {
  cy.log('pickDate');

});

// ===================== uploadFile =====================

Cypress.Commands.add("uploadFile", { prevSubject: 'optional' }, (subject, {
  cyData,
  insertValue
}) => {
  cy.log('uploadFile');

  cy.get(`[data-cy="${cyData}.expand"]`)
    .click();

  cy.get(`[data-cy="${cyData}"]`)
    .find('label')
    .selectFile(`cypress/fixtures/${insertValue}`);

  cy.get(`[data-cy="${cyData}"]`)
    .contains('Upload')
    .click();

  cy.wait(420);

  cy.closeNotification();
});

// ===================== checkElement =====================

Cypress.Commands.add("checkElement", { prevSubject: 'optional' }, (subject, {
  cyData,
  testData,
  containsText,
  containsValue,
  targetCount,
  isDisabled,
  isChecked,
}) => {
  cy.log('checkElement');
  if (targetCount === 0) {
    return cy
      .get(`[data-cy="${cyData}"]`)
      .should('not.exist');
  }

  cy.get(`[data-cy="${cyData}"]`)
    .then(
      (element) => {
        if (testData) {
          expect(element).to.have.attr('data-test', testData);
        }

        if (containsText != undefined) {
          expect(element.text().trim()).to.contain(containsText);
        }

        if (containsValue) {
          expect(element).to.have.value(containsValue);
        }

        if (isDisabled != undefined) {
          if (cyData?.includes('selectField')) {
            isDisabled ?
              expect(element).to.have.class('mat-select-disabled') :
              expect(element).to.not.have.class('mat-select-disabled');
          } else {
            isDisabled ?
              expect(element).to.be.disabled :
              expect(element).to.be.enabled;
          }
        }

        // * Causing problem when creating/copying orders (orderPlaced)
        if (isChecked != undefined) {
          isChecked ?
            expect(element).to.have.class('mat-checked') :
            expect(element).to.not.have.class('mat-checked');
        }
      }
    );

  return;
});

// ===================== getProperty =====================

Cypress.Commands.add("getProperty", { prevSubject: 'optional' }, (subject, {
  cyData,
  propertyName
}) => {
  cy.log('getProperty');

  return cy
    .get(`[data-cy="${cyData}"]`)
    .invoke('attr', propertyName!);
});
