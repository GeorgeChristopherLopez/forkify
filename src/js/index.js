import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
/** Global STate of the app
*- search object 
*- current recipe of the objet
*- Shopping List object  
*- Liked recipes 

*/



const state = {};









/// search controller
	const controlSearch = async () => {
	// 1. get teh query from view
	
	const query = searchView.getInput(); // TODO


	if(query){
		// 2) new search object and add add to state
		state.search = new Search(query);
		
		// 3) Prepare UI for results
		searchView.clearResults();
		searchView.clearInput();
		renderLoader(elements.searchRes);
		
		try{
			// 4) Search for recipes
			await state.search.getResults();


			//5 render results on UI
			clearLoader();
			searchView.renderResults(state.search.result);
				
		}   catch (err){
			alert('something went wrong with processing the search')
				clearLoader();
		}
	}

};

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});



elements.searchResPages.addEventListener('click', e=>{
	const btn = e.target.closest('.btn-inline');
	if(btn){
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	
	}
});

////////////// recipe controller

const controlRecipe = async ()=>{
	// get id from url
	const id = window.location.hash.replace('#', '');
	//console.log(id);
	if (id){
		// prepare ui for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// highlight selected search item
		if(state.search) searchView.highlightSelected(id);


		//create new recipe object
		state.recipe = new Recipe(id);
	
		try{
			// get recipe data and parse ingredients
			await state.recipe.getRecipe();
			//console.log(state.recipe.ingredients);
			state.recipe.parseIngredients();


            //console.log()
			// calc servings and time
			state.recipe.calcTime();
			state.recipe.calcServings();


            // render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {

			alert('something went wrong processing the recipe')

		}

	}
};

//window.addEventListener('hashchange', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/////**********   LIST CONTROLLER    *************/////////

const controlList = () =>{
	//create a new list IF there isnt one
	if(!state.list) state.list = new List();

	//add each ingredient to the list
	state.recipe.ingredients.forEach(el =>{
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

// handle delete and update list  item events


elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;


    // handle the delete method
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //del from site
        state.list.deleteItem(id);
        // del from ui
        listView.deleteItem(id);

        //hand the count update
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/////**********  LIKE CONTROLLER    *************/////////

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //user has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);
       



    //user HAS like current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);


        // Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());

};

//Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle button like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());


    //render the exhisting likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});






// handling recipe button clicks

elements.recipe.addEventListener('click', e=>{
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredient to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //like controller
        controlLike();
    }
	
});


