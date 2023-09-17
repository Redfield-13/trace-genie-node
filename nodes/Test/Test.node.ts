 import {IExecuteFunctions,} from 'n8n-core';

import {
	IDataObject,INodeExecutionData,INodeType,INodeTypeDescription,} from 'n8n-workflow';

// Main Class
export class Test implements INodeType {
    description: INodeTypeDescription = {
      displayName: 'Trace',
      name: 'Trace',
      icon: 'file:exchangeRate.svg',
      group: ['input'],
      version: 1,
      description: 'Fetch Population and Household data associated with postcodes',
      defaults: {
        name: 'Trace',
        color: '#00adee',
      },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [],
    properties: [
        {
          displayName: 'Fetch Type',
          name: 'FetchType',
          type: 'options',
          noDataExpression: true,
          options: [
            {
              name: 'Postcode',
              value: 'postcode',
              action: 'Subscribers'
            },
            {
              name: 'Postcode and Address',
              value: 'address',
              action: 'Campaigns',
            },
            {
              name: 'Name and Town',
              value: 'town',
              action: 'Campaigns',
            }
          ],
          default:"postcode"

        },{
          displayName: 'Postcode',
          name: 'post',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['postcode']
            },
          },

        },{
          displayName: 'First Name',
          name: 'Fname',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['town']
            },
          },

        },{
          displayName: 'Last Name',
          name: 'Lname',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['town']
            },
          },

        },{
          displayName: 'Town',
          name: 'townn',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['town']
            },
          },

        },{
          displayName: 'Postcode',
          name: 'post',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['address']
            },
          },

        },{
          displayName: 'Address',
          name: 'addr',
          type: 'string',
          noDataExpression: true,
          default:"",
          displayOptions: {
            show: {
              FetchType: ['address']
            },
          },

        },   
      ],
      
    }
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

        const mysql = require('mysql');

        const connection = mysql.createConnection({
          host: 'localhost',
          user: 'trace',
          password: 'Mj2002dr%',
          database: 'results'
        });

        connection.connect((err: any) => {
          if (err) throw err;
          console.log('Connected!');
        });
        let i = 0

        async function saveResultToFile(result: any) {
          try {
            const sqll = 'INSERT INTO finalS (name, address, occupants, postcode, town, phone, birthYear) VALUES (?, ?, ?, ?,?, ?,?)';
            const values = [result.name, result.address, JSON.stringify(result.occupants), result.postcode, result.town, result.phone, result.year_of_birth];
            connection.query(sqll, values, (err: any, result: any) => {
              if (err) {
                  console.error('Error inserting data: ', err);
              } else {
                  console.log('Record NO. ',i++,' : Data inserted successfully!');
              }
            }); 
          } catch (err) {
            console.error('Error saving file:', err);
          }
        }

        const items = this.getInputData();
        const length = items.length as unknown as number;
        const responseData: IDataObject[] = [];
        const FetchType = this.getNodeParameter('FetchType',0) as string;
    
        for (let i = 0; i < length; i++) {
          if (FetchType == 'postcode') {
            const postcode = this.getNodeParameter('post',i) as string;
            let Url = `http://localhost:4000/postcodes?postcode=${postcode}`;
            let response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            let trace = response
            if (trace.length == 0) {
              Url = `http://localhost:9999/postcode?postcode=${postcode}`
              response = await this.helpers.request({ method: 'GET', url: Url, json: true });
              trace = response
              for (const result of trace) {
                await saveResultToFile(result);
              }
            }
            responseData.push({ postcode, trace });
          }
          if (FetchType == 'address') {
            const postcode = this.getNodeParameter('post',i) as string;
            const addr = this.getNodeParameter('addr',i) as string;
            let Url = `http://localhost:4000/postcode&address?postcode=${postcode}&address=${addr}`;
            let response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            let trace = response
            if (trace.length == 0) {
              Url = `http://localhost:9999/postcodes?postcode=${postcode}&address=${addr}`;
              response = await this.helpers.request({ method: 'GET', url: Url, json: true });
              trace = response
            }
            responseData.push({ postcode, trace });
          }
          if (FetchType == 'town') {
            const Fname = this.getNodeParameter('Fname',i) as string;
            const Lname = this.getNodeParameter('Lname',i) as string;
            const townn = this.getNodeParameter('townn',i) as string;
            let Url = `http://localhost:4000/name&town?name=${Fname} ${Lname}&town=${townn}`;
            let response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            let trace = response
            if (trace.length == 0) {
              Url = `http://localhost:9999/name?fname=${Fname}&lname=${Lname}&town=${townn}`;
              response = await this.helpers.request({ method: 'GET', url: Url, json: true });
              trace = response
            }
            
            responseData.push({ townn, trace });
          }
        }
    
        return this.prepareOutputData(responseData.map((item) => ({ json: item })));
      }
    }