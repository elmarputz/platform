/// <reference types="Cypress" />

import ProductPageObject from '../../../support/pages/module/sw-product.page-object';

describe('Property: Test ACL privileges', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                cy.loginViaApi();
            })
            .then(() => {
                return cy.createDefaultFixture('payment-method');
            })
            .then(() => {
                cy.openInitialPage(`${Cypress.env('admin')}#/sw/settings/payment/index`);
            });
    });

    it('@settings: has no access to payment module', () => {
        cy.window().then((win) => {
            if (!win.Shopware.Feature.isActive('FEATURE_NEXT_3722')) {
                return;
            }

            cy.loginAsUserWithPermissions([
                {
                    key: 'product',
                    role: 'viewer'
                }
            ]).then(() => {
                cy.openInitialPage(`${Cypress.env('admin')}#/sw/settings/payment/index`);
            });

            // open settings-payment without permissions
            cy.get('.sw-privilege-error__access-denied-image').should('be.visible');
            cy.get('h1').contains('Access denied');
            cy.get('.sw-settings-payment-list').should('not.exist');

            // see menu without settings-payment menu item
            cy.get('.sw-admin-menu__item--sw-settings').click();
            cy.get('.sw-admin-menu__navigation-list-item.sw-settings-payment').should('not.exist');
        });
    });

    it('@settings: can view payment', () => {
        cy.window().then((win) => {
            if (!win.Shopware.FeatureConfig.isActive('next3722')) {
                return;
            }

            cy.loginAsUserWithPermissions([
                {
                    key: 'payment',
                    role: 'viewer'
                }
            ]).then(() => {
                cy.visit(`${Cypress.env('admin')}#/sw/settings/payment/index`);
            });

            // open settings-payment
            cy.contains('.sw-data-grid__cell-value', 'CredStick').click();

            // check settings-payment values
            cy.get('.sw-payment-detail__save-action').should('be.disabled');
        });
    });

    it('@settings: can edit payment', () => {
        cy.window().then((win) => {
            if (!win.Shopware.Feature.isActive('FEATURE_NEXT_3722')) {
                return;
            }

            // Request we want to wait for later
            cy.server();
            cy.route({
                url: '/api/v*/payment-method/*',
                method: 'patch'
            }).as('savePayment');

            const page = new ProductPageObject();

            cy.loginAsUserWithPermissions([
                {
                    key: 'payment',
                    role: 'viewer'
                }, {
                    key: 'payment',
                    role: 'editor'
                }
            ]).then(() => {
                cy.visit(`${Cypress.env('admin')}#/sw/settings/payment/index`);
            });

            // open payment method
            cy.contains('.sw-data-grid__cell-value', 'CredStick').click();
            cy.get('#sw-field--paymentMethod-description').type('My description');

            // Verify updated payment method
            cy.get('.sw-payment-detail__save-action').should('not.be.disabled');
            cy.get('.sw-payment-detail__save-action').click();
            cy.wait('@savePayment').then((xhr) => {
                expect(xhr).to.have.property('status', 204);
            });

            cy.get(page.elements.smartBarBack).click();
            cy.get(`${page.elements.dataGridRow}--0 .sw-data-grid__cell--description`)
                .contains('My description');

        });
    });

    it('@settings: can create payment', () => {
        cy.window().then((win) => {
            if (!win.Shopware.Feature.isActive('FEATURE_NEXT_3722')) {
                return;
            }

            // Request we want to wait for later
            cy.server();
            cy.route({
                url: `${Cypress.env('apiPath')}/payment-method`,
                method: 'post'
            }).as('saveData');

            const page = new ProductPageObject();

            cy.loginAsUserWithPermissions([
                {
                    key: 'payment',
                    role: 'viewer'
                }, {
                    key: 'payment',
                    role: 'editor'
                }, {
                    key: 'payment',
                    role: 'creator'
                }
            ]).then(() => {
                cy.visit(`${Cypress.env('admin')}#/sw/settings/payment/create`);
            });

            // Add payment method
            cy.get('#sw-field--paymentMethod-name').typeAndCheck('1 Coleur');
            cy.get('.sw-payment-detail__save-action').should('not.be.disabled');
            cy.get('.sw-payment-detail__save-action').click();

            // Verify payment method in listing
            cy.wait('@saveData').then((xhr) => {
                expect(xhr).to.have.property('status', 204);
            });
            cy.get(page.elements.smartBarBack).click();
            cy.contains('.sw-data-grid__row', '1 Coleur');
        });
    });

    it('@settings: can delete settings-payment', () => {
        cy.window().then((win) => {
            if (!win.Shopware.Feature.isActive('FEATURE_NEXT_3722')) {
                return;
            }

            // Request we want to wait for later
            cy.server();
            cy.route({
                url: '/api/v*/payment-method/*',
                method: 'delete'
            }).as('deleteData');

            const page = new ProductPageObject();

            cy.loginAsUserWithPermissions([
                {
                    key: 'payment',
                    role: 'viewer'
                }, {
                    key: 'payment',
                    role: 'deleter'
                }
            ]).then(() => {
                cy.visit(`${Cypress.env('admin')}#/sw/settings/payment/index`);
            });

            // open settings-payment
            cy.clickContextMenuItem(
                `${page.elements.contextMenu}-item--danger`,
                page.elements.contextMenuButton,
                `${page.elements.dataGridRow}--0`
            );
            cy.get(`${page.elements.modal} .sw-settings-payment-list__confirm-delete-text`)
                .contains('Are you sure you want to delete the payment method');
        });
    });
});
