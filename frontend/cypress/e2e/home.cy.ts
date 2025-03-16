import "@testing-library/cypress/add-commands";
import "../support/commands";

describe("Countries Application", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("Displays the navigation bar correctly", () => {
        cy.findByRole('banner').should('exist');
        cy.findByRole('link', { name: "Home" }).should("exist");
        cy.findByRole('link', { name: "Countries" }).should("exist");
    });

    it('Shows a list of countries', () => {
        cy.findByRole('link', { name: "Countries" }).click();
        // wait for the page to load
        cy.url().should('include', '/countries');
      

    })
    it("More than 200 countries are displayed", () => {
        cy.findByRole('link', { name: "Countries" }).click();
        cy.get('.MuiCard-root').should('have.length.greaterThan', 200);
    })

})