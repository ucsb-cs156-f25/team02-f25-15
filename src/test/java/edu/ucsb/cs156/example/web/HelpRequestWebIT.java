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
public class HelpRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_helprequest() throws Exception {
    setupUser(true);

    page.getByText("Help Requests").click();

    page.getByText("Create Help Request").click();
    assertThat(page.getByText("Create New Help Request")).isVisible();
    page.getByLabel("Requester Email").fill("kelvinfang@ucsb.edu");
    page.getByLabel("Team Id").fill("f25-5pm-15");
    page.getByLabel("Table Or Breakout Room").fill("15");
    page.getByLabel("Explanation").fill("CrudHelp");
    page.getByLabel("Request Time (iso format)").fill("2022-01-03T00:00");
    page.getByLabel("Solved").check();

    page.locator("button:has-text('Create')").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("kelvinfang@ucsb.edu");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Help Request")).isVisible();
    page.getByLabel("Requester Email").fill("kelvinfangedited@ucsb.edu");
    page.getByText("Update").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("kelvinfangedited@ucsb.edu");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_helprequest() throws Exception {
    setupUser(false);

    page.getByText("Help Requests").click();

    assertThat(page.getByText("Create Help Request")).not().isVisible();
    // assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-name")).not().isVisible();
  }
}
