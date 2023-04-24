// Cypress end2end testing will open in its own mini-application. When it does,
// click on a test or on 'run all specs' to pop open a browser instance that
// will open the app and interact with it according to the instructions in the
// body of the test.
// https://docs.cypress.io/api/introduction/api.html

describe("My First Test", () => {
  it("Visits the app root url", () => {
    cy.visit("/");
    cy.contains("This is a Demonstration Protocol.");
  });
});
