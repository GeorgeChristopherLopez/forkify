import axios from 'axios';
import {key, proxy} from '../config';


export default class Search {
		constructor(query){
			this.query =query;

		}
		async getResults() {
			
			try{
                const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
			this.result = res.data.recipes;
			//console.log(this.result);
			} catch(error){
				alert('Something went wrong with the search');
			}
			
			
	}
}






//getResults('tomato pasta');
//API Key: 0971a9b5de1ea4f7665b52fb9d50f398 
//https://www.food2fork.com/api/search