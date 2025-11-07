package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {
    setupUser(true);

    page.getByText("UCSBOrganization").click();

    page.getByText("Create UCSBOrganization").click();
    assertThat(page.getByText("Create New UCSBOrganization")).isVisible();
    page.getByLabel("Code").fill("OSLI");
    page.getByLabel("Short Name").fill("STUDENT LIFE");
    page.getByLabel("Full Name").fill("OFFICE OF STUDENT LIFE");
    page.getByLabel("Inactive").click();
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("OSLI");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("STUDENT LIFE");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("OFFICE OF STUDENT LIFE");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-inactive")).hasText("true");
    // edit
    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBOrganization")).isVisible();
    page.getByLabel("Short Name").fill("STUDENT LIFE EDITED");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("STUDENT LIFE EDITED");

    // delete
    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();

    //   page.getByTestId("RestaurantTable-cell-row-0-col-Edit-button").click();
    //   assertThat(page.getByText("Edit Restaurant")).isVisible();
    //   page.getByTestId("RestaurantForm-description").fill("THE BEST");
    //   page.getByTestId("RestaurantForm-submit").click();

    //   assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-description")).hasText("THE
    // BEST");

    //   page.getByTestId("RestaurantTable-cell-row-0-col-Delete-button").click();

    //   assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsborganization() throws Exception {
    setupUser(false);

    page.getByText("UCSBOrganization").click();

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_ucsborganization() throws Exception {
    setupUser(true);
    page.getByText("UCSBOrganization").click();
    assertThat(page.getByText("Create UCSBOrganization")).isVisible();
  }
}
