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
        const items = this.getInputData();
        const length = items.length as unknown as number;
        const responseData: IDataObject[] = [];
        const FetchType = this.getNodeParameter('FetchType',0) as string;
    
        for (let i = 0; i < length; i++) {
          if (FetchType == 'postcode') {
            const postcode = this.getNodeParameter('post',i) as string;
            const Url = `http://206.189.140.40:4000/postcodes?postcode=${postcode}`;
            const response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            const trace = response
            responseData.push({ postcode, trace });
          }
          if (FetchType == 'address') {
            const postcode = this.getNodeParameter('post',i) as string;
            const addr = this.getNodeParameter('addr',i) as string;
            const Url = `http://206.189.140.40:4000/postcodes?postcode=${postcode}&address=${addr}`;
            const response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            const trace = response
            responseData.push({ postcode, trace });
          }
          if (FetchType == 'town') {
            const Fname = this.getNodeParameter('Fname',i) as string;
            const Lname = this.getNodeParameter('Lname',i) as string;
            const townn = this.getNodeParameter('townn',i) as string;
            const Url = `http://206.189.140.40:4000/name&town?name=${Fname} ${Lname}&town=${townn}`;
            const response = await this.helpers.request({ method: 'GET', url: Url, json: true });
            const trace = response
            responseData.push({ townn, trace });
          }
        }
    
        return this.prepareOutputData(responseData.map((item) => ({ json: item })));
      }
    }