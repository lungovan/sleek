import { And, Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import "cypress-real-events/support";
import 'cypress-iframe';

const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

var appointment_date_str
var date_for_search_button
var verify_time
var verify_date

// Continue run on uncaught exception
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

Given("I navigate to Sleek SG", (url="/") => {
  cy.viewport(1900, 900);
  cy.visit(url);
});

When("I click on {string} link", (string) => {
  if (string === 'Incorporation') 
  {
    cy.contains(string).realHover().wait(100)
  }
  else 
  {
    cy.contains(string).click({force:true}).wait(1000)
  }
});

Then(/^Verify Business Account deposit or monthly fees table values$/, (data) => {
  const rows = data.hashes()
  const keys = Object.keys(rows[0])
  cy.scrollTo(0, 1000).wait(1000)
  cy.get(".elementor-section.elementor-top-section.elementor-element.elementor-hidden-mobile.elementor-section-boxed.elementor-section-height-default.nitro-offscreen")
    .first().find(".elementor-section").each(($element, index) => {
      if (index != 0 && index != 9) 
      {
        cy.wrap($element).find(".elementor-heading-title").each(($subitem, subindex) => {
          if (subindex === 0) 
          {
            cy.wrap($subitem).invoke("text").then((text) => text.trim()).should("equal", keys[index-1])
          }
          else 
          {
            cy.wrap($subitem).invoke("text").then((text) => text.trim()).should("equal", rows[subindex-1][keys[index-1]])
          }
        })
      }
    })
});

And("I click on {string} button", (string) => {
  cy.contains(string).first().parent().trigger("mouseover", {force: true}).wait(1000)
  cy.contains(string).first().parent().click({force: true}).wait(1000)
  cy.contains(string).first().parent().trigger("mouseover", {force: true}).wait(1000)
  cy.contains(string).first().parent().click({force: true}).wait(1000)
});

And("select a date {string} days from now", (number) => {
  cy.log(number)
  var appointment_date = new Date(Date.now() + number * 86400000);
  var appointment_date_weekday = appointment_date.toLocaleString('default', { weekday: 'long'});

  // Move to next Monday if the appoiment date is on Sat or Sun
  if (appointment_date_weekday.toLowerCase() === "saturday") 
  {
    appointment_date = new Date(appointment_date.getTime() + 2 * 86400000);
    appointment_date_weekday = appointment_date.toLocaleString('default', { weekday: 'long'});
  }
  if (appointment_date_weekday.toLowerCase() === "sunday") 
  {
    appointment_date = new Date(appointment_date.getTime() + 1 * 86400000);
    appointment_date_weekday = appointment_date.toLocaleString('default', { weekday: 'long'});
  }
  
  var day = appointment_date.getDate()
  appointment_date_str = appointment_date.toLocaleString('default', { month: 'long', day: 'numeric' });
  var year = appointment_date.getFullYear();

  cy.log(appointment_date_str + nth(day))
  cy.log(appointment_date_weekday)
  cy.log(year)

  date_for_search_button = appointment_date_str + nth(day)
  verify_date = appointment_date_weekday + ", " + appointment_date_str + ", " + year

  cy.get('.meetings-iframe-container', {timeout:10000}).find('iframe')
  cy.iframe("div.dialog-message.dialog-lightbox-message > div > div > section > div > div > div > div > div > div > iframe")
    .find(`button[aria-label="${date_for_search_button}"]`).click()
});

And("select time zone as {string}", (timezone) => {
  cy.log(timezone)
  cy.iframe("div.dialog-message.dialog-lightbox-message > div > div > section > div > div > div > div > div > div > iframe")
  .find("span.private-dropdown__item__label").click()
  cy.iframe("div.dialog-message.dialog-lightbox-message > div > div > section > div > div > div > div > div > div > iframe")
    .find(`button[title="${timezone}"]`).click()
});

And("set time as {string}", (time) => {
  cy.log(time)
  verify_time = time.toUpperCase()
  cy.iframe("div.dialog-message.dialog-lightbox-message > div > div > section > div > div > div > div > div > div > iframe")
    .find(`span[aria-label="${time} on ${date_for_search_button}"]`).click()  
});

And("Verify date and time value is correct in Your information section", () => {
  cy.iframe("div.dialog-message.dialog-lightbox-message > div > div > section > div > div > div > div > div > div > iframe")
  .find('.m-bottom-0').should("have.text", `${verify_date} ${verify_time}`)
});



