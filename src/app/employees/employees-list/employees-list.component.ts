import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/employee';
import { EmployeeService } from 'src/app/employee.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
})
export class EmployeesListComponent implements OnInit {
  employees: Employee[] = [];
  constructor(private employeesService: EmployeeService) {}

  ngOnInit(): void {}

  public getEmployees(): void {
    this.employeesService.getEmployees().subscribe((employees: Employee[]) => {
      this.employees = employees;
    });
  }
}
