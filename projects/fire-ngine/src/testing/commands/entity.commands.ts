
// ===================== saveEntity =====================

Cypress.Commands.add("saveEntity", { prevSubject: 'optional' }, (subject, {
  steps,
  operation,
  customOperation,
  colPath,
  queryFilter,
}) => {
  cy.log(`saveEntity -> ${operation}`);

  if (colPath) {
    cy.checkCollection({
      colPath,
      queryFilter,
    });
  }

  cy.getProperty({
    cyData: 'module.form.elementEntityId',
    propertyName: 'data-test'
  }).then(
    prop => {
      sessionStorage.setItem(
        operation === 'create' || operation === 'copy' ? 'createId' : 'updateId',
        prop
      );
    }
  );

  steps?.forEach(
    (step) => {
      cy.
        clickElement({
          cyData: `module.form.step.${step.name}`,
        });
      step.fields.forEach(
        (field) => {
          const cyData = `module.form.step.${step.name}.${field.type}Field.${field.name}`;

          if (field.value == undefined && field.data == undefined) {
            if (field.fieldDisabled) {
              cy.checkElement({
                cyData,
                isDisabled: true
              });
            }

            if (field.target != undefined) {
              switch (field.type) {
                case 'switch':
                  cy.checkElement({
                    cyData,
                    isChecked: !!field.target,
                  });
                  break;
                default:
                  cy.checkElement({
                    cyData,
                    containsValue: field.target?.toString(),
                  });
              }
            }
          } else {
            switch (field.type) {
              case 'input':
              case 'date':
              case 'text':
                cy.typeText({
                  cyData,
                  insertValue: field.value,
                  isInvalid: field.fieldInvalid
                });
                break;
              case 'select':
                cy.selectOption({
                  cyData,
                  testData: field.data,
                  containsText: field.value?.toString(),
                });
                break;
              case 'switch':
                cy.clickElement({
                  cyData,
                  isChecked: !!field.value,
                });
                break;
              case 'file':
                cy.uploadFile({
                  cyData,
                  insertValue: field.value,
                  expandPanel: field.expand,
                });
                break;
            }
          }

          if (field.formValid != undefined) {
            cy.wait(500)
              .checkElement({
                cyData: 'module.form.dialog.buttonSaveEntity',
                isDisabled: !field.formValid
              });
          }
        }
      );
    }
  );

  cy.wait(420);

  cy.clickElement({
    cyData: 'module.form.dialog.buttonSaveEntity',
  });

  cy.closeNotification();

  if (colPath) {
    cy.checkCollection({
      colPath,
      operation,
      customOperation,
      queryFilter,
    });
  }
});

// ===================== removeEntity =====================

Cypress.Commands.add("removeEntity", { prevSubject: 'optional' }, (subject, {
  operation = 'archive',
  colPath,
  queryFilter
}) => {
  cy.log(`removeEntity -> ${operation}`);

  if (colPath) {
    cy.checkCollection({
      colPath,
      operation,
      queryFilter,
    });
  }

  if (operation !== 'unarchive') {
    cy.clickElement({
      cyData: 'module.form.dialog.switchConfirmArchive'
    });

    if (operation === 'delete') {
      cy.clickElement({
        cyData: 'module.form.dialog.switchConfirmDelete'
      });
    }
  }

  cy.clickElement({
    cyData: 'module.form.dialog.buttonRemoveEntity'
  });

  cy.closeNotification();

  if (colPath) {
    cy.checkCollection({
      colPath,
      operation,
      queryFilter,
    });
  }
});

// ===================== checkEntities =====================

Cypress.Commands.add("checkEntities", { prevSubject: 'optional' }, (subject, {
  cyData,
  targetCount,
  targetIncrement,
  viewType,
  propertyName = 'querySize',
}) => {
  cy.log(`checkEntities`);

  if (viewType) {
    cy.setViewType(viewType);
  }

  cyData = cyData ?? (viewType === 'table' ?
    'module.overview.table.row' :
    'module.overview.grid.card'
  );
  if (targetCount === 0) {
    sessionStorage.setItem(propertyName, '0');

    return cy
      .get(`[data-cy="${cyData}"]`)
      .should('not.exist');
  }

  return cy
    .get(`[data-cy="${cyData}"]`)
    .then(
      (documents) => {
        if (targetCount != undefined) {
          expect(documents.length).to.equal(targetCount, 'targetCount');
        } else if (targetIncrement != undefined) {
          const oldCount = parseInt(sessionStorage.getItem(propertyName)!);
          const newCount = oldCount + targetIncrement;
          expect(documents.length).to.equal(newCount, 'querySize');
        } else { // no expect, just set storage
        }

        sessionStorage.setItem(propertyName, documents.length.toString());

        return documents;
      }
    );
});

// ===================== checkActions =====================

Cypress.Commands.add("checkActions", { prevSubject: 'optional' }, (subject, {
  actionsType,
  actionsList,
  entityId,
  viewType,
}) => {

  cy.openMenu({
    actionsType,
    entityId: entityId ?? sessionStorage.getItem('createId') ?? sessionStorage.getItem('updateId')!,
    viewType,
  });

  cy.log(`checkActions -> ${actionsType}`);

  actionsList?.forEach(
    ({
      actionId,
      actionState,
      shouldExist = true,
    }) => {
      cy.checkElement({
        cyData: `app.lib.menu.buttonAction.${actionId}`,
        testData: actionState, // checked only if not undefined
        ...(!shouldExist && { targetCount: 0 })
      });
    }
  );

  cy.closeMenu();
});

// ===================== invokeAction =====================

Cypress.Commands.add("invokeAction", { prevSubject: 'optional' }, (subject, {
  actionsType,
  action,
  entityId,
  viewType = 'grid',
}) => {
  if (actionsType === 'document' && !entityId) {
    // open document menu of first element on the list
    const cyData = (viewType === 'table' ?
      'module.overview.table.row' :
      'module.overview.grid.card'
    );

    cy.getProperty({
      cyData,
      propertyName: 'data-test'
    }).then(
      (entityId: string) => {
        sessionStorage.setItem('targetId', entityId);

        cy.openMenu({
          actionsType,
          entityId,
          viewType,
        });
      }
    );
  } else {
    cy.openMenu({
      actionsType,
      entityId,
      viewType,
    });
  }

  cy.log(`invokeAction: ${actionsType} -> ${action!.actionId}`);

  cy.clickElement({
    cyData: `app.lib.menu.buttonAction.${action!.actionId}`,
    testData: action!.actionState // optionally also check current action state
  });

  cy.closeMenu();
});

// ===================== checkTable =====================

Cypress.Commands.add("checkTable", { prevSubject: 'optional' }, (subject, {
  entityId,
  tableColumns,
  colPath,
}) => {
  const tableEntityId = entityId ?? sessionStorage.getItem('createId') ?? sessionStorage.getItem('updateId')!;

  cy.setViewType('table');

  cy.getDocument({
    docId: tableEntityId,
    colPath,
  }).then(
    entity => {
      tableColumns?.forEach(
        column => {
          cy.checkElement({
            cyData: `module.overview.table.${column.columnDef}.${tableEntityId}`,
            containsText: column.content(entity) ?? '',
          })
        }
      )
    }
  );
});

// ===================== checkGrid =====================

Cypress.Commands.add("checkGrid", { prevSubject: 'optional' }, (subject, {
  entityId,
  gridCard,
}) => {
  const cardEntityId = entityId ?? sessionStorage.getItem('createId') ?? sessionStorage.getItem('updateId')!;

});