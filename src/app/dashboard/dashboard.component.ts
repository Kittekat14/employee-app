import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  DoCheck,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent
  implements
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  @Input() showTopEmployees: boolean = true;

  topEmployees: Employee[] = [];

  constructor(
    private employeeService: EmployeeService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessagesService,
  ) {
    this.messageService.add('constructor ' + this.showTopEmployees);
  }

  ngOnInit(): void {
    this.messageService.add('Dashboard OnInit ' + this.showTopEmployees);
    const queryParams = this.activatedRoute.snapshot.queryParamMap;
    if (queryParams.has('showTopEmployees')) {
      this.showTopEmployees = queryParams.get('showTopEmployees') === 'true';
    }
    this.getTopEmployees();
  }

  ngDoCheck() {
    this.messageService.add('Dashboard DoCheck');
  }

  ngAfterContentInit() {
    this.messageService.add('Dashboard AfterContentInit');
  }

  ngAfterContentChecked() {
    this.messageService.add('Dashboard AfterContentChecked');
  }

  ngAfterViewInit() {
    this.messageService.add('Dashboard AfterViewInit');
  }

  ngAfterViewChecked() {
    this.messageService.add('Dashboard AfterViewCheck');
  }

  ngOnDestroy() {
    this.messageService.add('Dashboard OnDestroy');
  }

  getTopEmployees(): void {
    this.employeeService
      .getEmployees()
      .subscribe((employees) => (this.topEmployees = employees.slice(0, 5)));
  }
}
