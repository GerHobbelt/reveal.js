<?php
class CriticalPathTest extends PHPUnit_Extensions_SeleniumTestCase
{
  protected function setUp()
  {
    $this->setBrowser("*chrome");
    $this->setBrowserUrl("http://localhost:8080/");
  }

  public function testLogout()
  {
    $this->open("/tcm/");
    $this->type("id=edit-name", "admin");
    $this->type("id=edit-pass", "admin");
    $this->click("id=edit-submit");
    $this->waitForPageToLoad("30000");
    $this->click("css=li.menu-15.last > a");
    $this->waitForPageToLoad("30000");
  }
  public function testLogin()
  {
    $this->open("/tcm/");
    $this->type("id=edit-name", "admin");
    $this->type("id=edit-pass", "admin");
    $this->click("id=edit-submit");
    $this->waitForPageToLoad("30000");
    $this->assertEquals("My account", $this->getText("css=#secondary-menu-links li.first a"));
    for ($second = 0; ; $second++) {
      if ($second >= 60) $this->fail("timeout");
      try {
        if ($this->isElementPresent("css=li.menu-15.last > a")) break;
      } catch (Exception $e) {}
      sleep(1);
    }

    $this->click("css=li.menu-15.last > a");
    $this->waitForPageToLoad("30000");
  }
  public function testCreateTestCase() 
  {
    $this->open("/tcm/");
    $this->type("id=edit-name", "admin");
    $this->type("id=edit-pass", "admin");
    $this->click("id=edit-submit");
    $this->waitForPageToLoad("30000");
    $this->click("xpath=(//a[contains(text(),'Add content')])[2]");
    for ($second = 0; ; $second++) {
      if ($second >= 60) $this->fail("timeout");
      try {
        if ($this->isElementPresent("link=Test Case")) break;
      } catch (Exception $e) {}
      sleep(1);
    }

    $this->click("link=Test Case");
    for ($second = 0; ; $second++) {
      if ($second >= 60) $this->fail("timeout");
      try {
        if ($this->isElementPresent("id=edit-title")) break;
      } catch (Exception $e) {}
      sleep(1);
    }

    $this->type("id=edit-title", "Test Test Case");
    $this->type("id=edit-body-und-0-value", "This is a test test case.");
    $this->type("id=edit-field-prerequisites-und-0-value", "User Must be logged in.");
    $this->type("id=edit-field-steps-und-0-step", "Click on the View Test case link");
    $this->type("id=edit-field-steps-und-0-verify", "You should see the testcase");
    $this->click("css=form#test-case-node-form #edit-submit");
    $this->waitForPageToLoad("30000");
    for ($second = 0; ; $second++) {
      if ($second >= 60) $this->fail("timeout");
      try {
        if ($this->isElementPresent("id=page-title")) break;
      } catch (Exception $e) {}
      sleep(1);
    }

    $this->assertEquals("Test Test Case", $this->getText("id=page-title"));
    $this->assertEquals("This is a test test case.", $this->getText("css=p"));
    $this->assertEquals("Click on the View Test case link You should see the testcase", $this->getText("//div[contains(@class,'node-test-case')]/div[2]/div[2]/div[2]/div"));
    $this->assertEquals("User Must be logged in.", $this->getText("//div[contains(@class,'node-test-case')]/div[2]/div[3]/div[2]/div/p"));
    $this->click("css=li.menu-15.last > a");
    $this->waitForPageToLoad("30000");
    $this->assertEquals("User login", $this->getText("css=#block-user-login h2"));
  }
}
?>
