import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';

const expectedH1 = 'Tour of Employees';
const expectedTitle = `${expectedH1}`;
const targetEmployee = { id: 15, name: 'Magneta' };
const targetEmployeeDashboardIndex = 3;
const nameSuffix = 'X';
const newEmployeeName = targetEmployee.name + nameSuffix;

class Employee {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Employee from string formatted as '<id> <name>'.
  static fromString(s: string): Employee {
    return new Employee(
      +s.substr(0, s.indexOf(' ')),
      s.substr(s.indexOf(' ') + 1),
    );
  }

  // Employee from employee list <li> element.
  static async fromLi(li: ElementFinder): Promise<Employee> {
    const stringsFromA = await li.all(by.css('a')).getText();
    const strings = stringsFromA[0].split(' ');
    return { id: +strings[0], name: strings[1] };
  }

  // Employee id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Employee> {
    // Get employee id from the first <div>
    const id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    const name = await detail.element(by.css('h2')).getText();
    return {
      id: +id.substr(id.indexOf(' ') + 1),
      name: name.substr(0, name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    const navElts = element.all(by.css('app-root nav a'));

    return {
      navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topEmployees: element.all(by.css('app-root app-dashboard > div a')),

      appEmployeesHref: navElts.get(1),
      appEmployees: element(by.css('app-root app-employees')),
      allEmployees: element.all(by.css('app-root app-employees li')),
      selectedEmployeeSubview: element(by.css('app-root app-employees > div:last-child')),

      employeeDetail: element(by.css('app-root app-employee-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, async () => {
      expect(await browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, async () => {
      await expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Employees'];
    it(`has views ${expectedViewNames}`, async () => {
      const viewNames = await getPageElts().navElts.map(el => el!.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
      const page = getPageElts();
      expect(await page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top employees', async () => {
      const page = getPageElts();
      expect(await page.topEmployees.count()).toEqual(4);
    });

    it(`selects and routes to ${targetEmployee.name} details`, dashboardSelectTargetEmployee);

    it(`updates employee name (${newEmployeeName}) in details view`, updateEmployeeNameInDetailView);

    it(`cancels and shows ${targetEmployee.name} in Dashboard`, async () => {
      await element(by.buttonText('go back')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetEmployeeElt = getPageElts().topEmployees.get(targetEmployeeDashboardIndex);
      expect(await targetEmployeeElt.getText()).toEqual(targetEmployee.name);
    });

    it(`selects and routes to ${targetEmployee.name} details`, dashboardSelectTargetEmployee);

    it(`updates employee name (${newEmployeeName}) in details view`, updateEmployeeNameInDetailView);

    it(`saves and shows ${newEmployeeName} in Dashboard`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetEmployeeElt = getPageElts().topEmployees.get(targetEmployeeDashboardIndex);
      expect(await targetEmployeeElt.getText()).toEqual(newEmployeeName);
    });

  });

  describe('Employees tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Employees view', async () => {
      await getPageElts().appEmployeesHref.click();
      const page = getPageElts();
      expect(await page.appEmployees.isPresent()).toBeTruthy();
      expect(await page.allEmployees.count()).toEqual(10, 'number of employees');
    });

    it('can route to employee details', async () => {
      await getEmployeeLiEltById(targetEmployee.id).click();

      const page = getPageElts();
      expect(await page.employeeDetail.isPresent()).toBeTruthy('shows employee detail');
      const employee = await Employee.fromDetail(page.employeeDetail);
      expect(employee.id).toEqual(targetEmployee.id);
      expect(employee.name).toEqual(targetEmployee.name.toUpperCase());
    });

    it(`updates employee name (${newEmployeeName}) in details view`, updateEmployeeNameInDetailView);

    it(`shows ${newEmployeeName} in Employees list`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular();
      const expectedText = `${targetEmployee.id} ${newEmployeeName}`;
      expect(await getEmployeeAEltById(targetEmployee.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newEmployeeName} from Employees list`, async () => {
      const employeesBefore = await toEmployeeArray(getPageElts().allEmployees);
      const li = getEmployeeLiEltById(targetEmployee.id);
      await li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(await page.appEmployees.isPresent()).toBeTruthy();
      expect(await page.allEmployees.count()).toEqual(9, 'number of employees');
      const employeesAfter = await toEmployeeArray(page.allEmployees);
      // console.log(await Employee.fromLi(page.allEmployees[0]));
      const expectedEmployees =  employeesBefore.filter(h => h.name !== newEmployeeName);
      expect(employeesAfter).toEqual(expectedEmployees);
      // expect(page.selectedEmployeeSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetEmployee.name}`, async () => {
      const addedEmployeeName = 'Alice';
      const employeesBefore = await toEmployeeArray(getPageElts().allEmployees);
      const numEmployees = employeesBefore.length;

      await element(by.css('input')).sendKeys(addedEmployeeName);
      await element(by.buttonText('Add employee')).click();

      const page = getPageElts();
      const employeesAfter = await toEmployeeArray(page.allEmployees);
      expect(employeesAfter.length).toEqual(numEmployees + 1, 'number of employees');

      expect(employeesAfter.slice(0, numEmployees)).toEqual(employeesBefore, 'Old employees are still there');

      const maxId = employeesBefore[employeesBefore.length - 1].id;
      expect(employeesAfter[numEmployees]).toEqual({id: maxId + 1, name: addedEmployeeName});
    });

    it('displays correctly styled buttons', async () => {
      const buttons = await element.all(by.buttonText('x'));

      for (const button of buttons) {
        // Inherited styles from styles.css
        expect(await button.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
        expect(await button.getCssValue('border')).toContain('none');
        expect(await button.getCssValue('padding')).toBe('1px 10px 3px');
        expect(await button.getCssValue('border-radius')).toBe('4px');
        // Styles defined in employees.component.scss
        expect(await button.getCssValue('left')).toBe('210px');
        expect(await button.getCssValue('top')).toBe('5px');
      }

      const addButton = element(by.buttonText('Add employee'));
      // Inherited styles from styles.css
      expect(await addButton.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
      expect(await addButton.getCssValue('border')).toContain('none');
      expect(await addButton.getCssValue('padding')).toBe('8px 24px');
      expect(await addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive employee search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      await getPageElts().searchBox.sendKeys('Ma');
      await browser.sleep(1000);

      expect(await getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      await getPageElts().searchBox.sendKeys('g');
      await browser.sleep(1000);
      expect(await getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetEmployee.name}`, async () => {
      await getPageElts().searchBox.sendKeys('n');
      await browser.sleep(1000);
      const page = getPageElts();
      expect(await page.searchResults.count()).toBe(1);
      const employee = page.searchResults.get(0);
      expect(await employee.getText()).toEqual(targetEmployee.name);
    });

    it(`navigates to ${targetEmployee.name} details view`, async () => {
      const employee = getPageElts().searchResults.get(0);
      expect(await employee.getText()).toEqual(targetEmployee.name);
      await employee.click();

      const page = getPageElts();
      expect(await page.employeeDetail.isPresent()).toBeTruthy('shows employee detail');
      const employee2 = await Employee.fromDetail(page.employeeDetail);
      expect(employee2.id).toEqual(targetEmployee.id);
      expect(employee2.name).toEqual(targetEmployee.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetEmployee() {
    const targetEmployeeElt = getPageElts().topEmployees.get(targetEmployeeDashboardIndex);
    expect(await targetEmployeeElt.getText()).toEqual(targetEmployee.name);
    await targetEmployeeElt.click();
    await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    const page = getPageElts();
    expect(await page.employeeDetail.isPresent()).toBeTruthy('shows employee detail');
    const employee = await Employee.fromDetail(page.employeeDetail);
    expect(employee.id).toEqual(targetEmployee.id);
    expect(employee.name).toEqual(targetEmployee.name.toUpperCase());
  }

  async function updateEmployeeNameInDetailView() {
    // Assumes that the current view is the employee details view.
    await addToEmployeeName(nameSuffix);

    const page = getPageElts();
    const employee = await Employee.fromDetail(page.employeeDetail);
    expect(employee.id).toEqual(targetEmployee.id);
    expect(employee.name).toEqual(newEmployeeName.toUpperCase());
  }

});

async function addToEmployeeName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getEmployeeAEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getEmployeeLiEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toEmployeeArray(allEmployees: ElementArrayFinder): Promise<Employee[]> {
  return allEmployees.map(employee => Employee.fromLi(employee!));
}
