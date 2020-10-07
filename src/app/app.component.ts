import { Component ,OnInit, ViewChild} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';


export interface PeriodicElement {
  name: string;
  weight: string;
  symbol: string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'Suhani', weight: "primary", symbol: '$ 1,000'},
  { name: 'Hans', weight: "accent", symbol: '$ 1,200'},
  { name: 'Heni', weight: "primary", symbol: '$ 1,300'},
  { name: 'Linda', weight: "primary", symbol: '$ 100'},
  { name: 'Mark', weight: "accent", symbol: '$ 1,000'}
];


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'my-angular-app';


  @ViewChild('drawer', { static: false }) 
  drawer: MatSidenav;
  public doughnutChartLabels = ['Sales Q1', 'Sales Q2', 'Sales Q3', 'Sales Q4'];
  public doughnutChartData = [120, 150, 180, 90];
  public doughnutcolor = [{
    backgroundColor: [
      '#0000FF',
      '#0066FF',
      '#0099FF',
      '#00CCFF'
    ]
  }]
  public doughnutChartType = 'doughnut';
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
  ];
  public barChartcolor = [{
    backgroundColor:[
      '#00FFFF',
      '#00FFFF',
      '#00FFFF',
      '#00FFFF',
      '#00FFFF',
      '#00FFFF',
      '#00FFFF'
    ]
  }

  ]

  public lineCharttype = 'LineChart';
  public linedata = [
     ["2006",  7.0, -0.2],
     ["2007",  6.9, 0.8],
     ["2008",  9.5,  5.7],
     ["2009",  14.5, 11.3],
     ["2010",  18.2, 17.0],
     ["2011",  21.5, 22.0],
     ["2012",  25.2, 24.8]
  ];
  public linecolumnNames = ["Series A","Series B"];
  public lineoptions = {   
     
  };
  width = 350;
  height = 400;


  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  
  constructor() { }

  ngOnInit(): void {
  }
  // sidenavEvents(str) {
  //   console.log(str);
  // }
}



