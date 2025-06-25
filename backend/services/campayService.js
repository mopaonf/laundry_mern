  const axios = require('axios');
const EventEmitter = require('events');

class CampayService extends EventEmitter {
   constructor() {
      super();
      this.baseUrl = 'https://demo.campay.net/api';
      // Test credentials
      this.username =
         'oXVVMWsdGLeokz5-cqIrB4cFLpTPtvMTRuqH2RT5pFCjHyjfGL_XDADcmAHL755jPoGgpA61pNRQy3DNpJRbpA';
      this.password =
         '2zvOQtDgvJehwcaT3n2OJ2YiiR0z1qcQLyiA0Rs2HJpHBaGC74nkwgxllCp9w58vArx_vmyab3RYaID_3oQO6w';
      this.appId =
         'DeFbCVjXIeD8fUW1gUXvNkh-bMHSN8O1iTYYSKZBQ6MmEOSHBqlXlSMCfpyvDqiU3W8XCFCfz0jmhQsClBSxoQ';
      this.token = null;
      this.pollingIntervals = new Map();

      console.log('CampayService initialized with test credentials');
   }

   async authenticate() {
      console.log('Attempting Campay authentication...');

      if (!this.appId) {
         throw new Error('Campay Application ID not configured');
      }

      try {
         const response = await axios.post(`${this.baseUrl}/token/`, {
            username: this.username,
            password: this.password,
            app_id: this.appId,
         });

         console.log('Authentication response:', {
            status: response.status,
            statusText: response.statusText,
            hasToken: !!response.data?.token,
         });

         if (!response.data?.token) {
            throw new Error('No token received from Campay');
         }

         this.token = response.data.token;
         return this.token;
      } catch (error) {
         console.error('Campay authentication error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
               url: error.config?.url,
               method: error.config?.method,
               headers: error.config?.headers,
            },
         });

         if (error.response?.status === 401) {
            throw new Error('Invalid Campay credentials');
         } else if (error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to Campay service');
         }

         throw new Error(`Campay authentication failed: ${error.message}`);
      }
   }

   async collect(amount, phoneNumber, description) {
      console.log('Starting collection process:', { amount, phoneNumber });

      try {
         if (!this.token) {
            console.log('No token found, authenticating...');
            await this.authenticate();
         }

         console.log('Sending collect request to Campay');
         const response = await axios.post(
            `${this.baseUrl}/collect/`,
            {
               amount: amount.toString(),
               from: phoneNumber,
               description: description,
               external_reference: Math.random().toString(36).substring(7),
            },
            {
               headers: { Authorization: `Token ${this.token}` },
            }
         );
         console.log('Collection response:', response.data);
         return response.data;
      } catch (error) {
         console.error('Collection error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
         });
         throw new Error(`Failed to initiate collection: ${error.message}`);
      }
   }

   async withdraw(amount, phoneNumber, description) {
      if (!this.token) await this.authenticate();

      try {
         const response = await axios.post(
            `${this.baseUrl}/withdraw/`,
            {
               amount: amount.toString(),
               to: phoneNumber,
               description: description,
               external_reference: Math.random().toString(36).substring(7),
            },
            {
               headers: { Authorization: `Token ${this.token}` },
            }
         );
         return response.data;
      } catch (error) {
         console.error('Campay withdraw error:', error);
         throw new Error('Failed to initiate withdrawal');
      }
   }

   async checkTransactionStatus(reference) {
      if (!this.token) await this.authenticate();

      try {
         const response = await axios.get(
            `${this.baseUrl}/transaction/${reference}/`,
            {
               headers: { Authorization: `Token ${this.token}` },
            }
         );
         return response.data;
      } catch (error) {
         console.error('Campay status check error:', error);
         throw new Error('Failed to check transaction status');
      }
   }

   startTransactionCheck(reference, maxAttempts = 20) {
      console.log(`Starting transaction check for ref: ${reference}`);
      let attempts = 0;

      const checkInterval = setInterval(async () => {
         try {
            const result = await this.checkTransactionStatus(reference);
            console.log(`Transaction status check result:`, result);

            const normalizedStatus = result.status?.toUpperCase();
            if (
               normalizedStatus === 'SUCCESSFUL' ||
               normalizedStatus === 'FAILED' ||
               attempts >= maxAttempts
            ) {
               this.emit('transactionUpdate', {
                  reference,
                  status: normalizedStatus || 'TIMEOUT',
                  data: result,
               });
               this.stopTransactionCheck(reference);
            }
            attempts++;
         } catch (error) {
            console.error(`Transaction check error for ${reference}:`, error);
            if (attempts >= maxAttempts) {
               this.emit('transactionUpdate', {
                  reference,
                  status: 'error',
                  error: error.message,
               });
               this.stopTransactionCheck(reference);
            }
            attempts++;
         }
      }, 10000); // Check every 10 seconds

      this.pollingIntervals.set(reference, checkInterval);
   }

   stopTransactionCheck(reference) {
      const interval = this.pollingIntervals.get(reference);
      if (interval) {
         clearInterval(interval);
         this.pollingIntervals.delete(reference);
         console.log(`Stopped checking transaction: ${reference}`);
      }
   }
}

module.exports = new CampayService();
