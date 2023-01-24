<template>
	<div class="content col-xxl-7 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="recipe-header">
			<h1 class="recipe-title">{{recipe.name}}</h1>
			<div class="rating">
				<div class="stars">
					<span class="star star-extra" :class="Math.round(rating) === 5 ? 'checked' : ''">☆</span>
					<span class="star star-five" :class="Math.round(rating) === 4 ? 'checked' : ''">☆</span>
					<span class="star star-four" :class="Math.round(rating) === 3 ? 'checked' : ''">☆</span>
					<span class="star star-three" :class="Math.round(rating) === 2 ? 'checked' : ''">☆</span>
					<span class="star star-two" :class="Math.round(rating) === 1 ? 'checked' : ''">☆</span>
					<span class="star star-one" >☆</span>
				</div>
				<span class="rating-count">({{ratingCount}} ratings)</span>
			</div>
		</div>
		<div class="favourite-container" v-show="userStore.loggedIn">
			<button class="favourite-button" :class="userFavourite ? 'yellow' : ''" @click="changeFavourites">
				<img class="heart-icon" v-if="!userFavourite" src="@/assets/icons/heart_outline_lightgrey.png" alt="heart">
				<img class="heart-icon" v-else src="@/assets/icons/heart_yellow.png" alt="heart">
				Favourite
			</button>
		</div>
		<div class="info-container">
			<span class="categories">{{categoriesStr}}</span>
			<div class="infos">
				<div class="info-item">
					<img class="icon time-icon" src="@/assets/icons/time_icon.png" alt="time">
					<span v-show="recipe.timeHour || recipe.timeMinute">
						<span>{{recipe.timeHour ? recipe.timeHour + "h" : ""}}</span>
						<span v-show="recipe.timeHour && recipe.timeMinute">{{" "}}</span>
						<span>{{recipe.timeMinute ? recipe.timeMinute + "m" : ""}}</span>
					</span>
					<span v-show="!recipe.timeHour && !recipe.timeMinute">-</span>
				</div>

				<div class="info-item">
					<img class="icon difficulty-icon" src="@/assets/icons/difficulty_icon.png" alt="difficulty">
					<span>{{recipe.difficulty ? recipe.difficulty : "-"}}</span>
				</div>

				<div class="info-item">
					<img class="icon cost-icon" src="@/assets/icons/money.png" alt="cost">
					<span>{{recipe.cost ? recipe.cost : "-"}}</span>
				</div>

				<div class="info-item">
					<img class="icon portions-icon" src="@/assets/icons/group.png" alt="portions">
					<span>{{recipe.portions ? recipe.portions : "-"}}</span>
				</div>

				<div class="info-item">
					<img class="icon calories-icon" src="@/assets/icons/calories.png" alt="calories">
					<span>{{recipe.calories ? recipe.calories + " kcal/portion" : "-"}}</span>
				</div>
			</div>
		</div>
		<div class="column-container">
			<div class="column-left">
				<div class="recipe-image-container">
					<img class="recipe-image" :src="'data:image/' + recipe.imageExt + ';base64,'+ recipe.image" alt="recipe-image" v-if="recipe.imageUrl && recipe.imageUrl !== 'default'" />
					<img class="recipe-image" src='/src/assets/default_recipe_photo.png' alt="recipe-image" v-else>
				</div>
				<div class="steps-header-container">
					<h3 class="steps-header">Steps</h3>
				</div>
				<div class="steps-container">
					<div class="step-container" v-for="(step, index) in recipe.steps" :key="index">
						<div class="number-container">
							<span class="number">{{step.number}}.</span>
						</div>
						<div class="content-container">
							<p class="content">{{step.content}}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="column-right">
				<div class="ingredients-container">
					<form>
						<div class="ingredients-header">
							<h3 class="ingredients-header-text">Ingredients</h3>
							<div class="check-all-container" v-if="userStore.loggedIn">
								<label for="check-all">All</label>
								<input class="check-all" type="checkbox" id="check-all" @change="changeAll">
							</div>
						</div>
						<div class="ingredient-list-container">
							<ul>
								<li class="ingredient-list-item"  v-for="(ingredient, index) in recipe.ingredients" :key="index">
									<div class="ingredient">
										<label :for="'check-ingredient' + index">
											<span class="amount">{{ingredient.amount ? ingredient.amount + " " : ""}}</span>
											<span class="unit">{{ingredient.unit ? ingredient.unit + " " : ""}}</span>
											<span class="name">{{ingredient.name}}</span>
										</label>
										<input class="checkbox-input" type="checkbox" :id="'check-ingredient' + index" v-model="selectedIngredients" :value="ingredient" v-show="userStore.loggedIn">
									</div>
								</li>
							</ul>
						</div>
						<button class="add-shoppinglist-btn" type="button" @click="addToShoppingList" v-show="userStore.loggedIn">+ Shopping list</button >
					</form>
				</div>
				<div class="allergens-header" v-show="recipe.allergens.length !== 0">
					<img class="warning-icon" src="@/assets/icons/warning.png" alt="warning"/>
					<span class="allergens-text">Allergens</span>
				</div>
				<div class="allergens" v-show="recipe.allergens.length !== 0">
					<div class="allergen" v-for="(allergen, index) in recipe.allergens" :key="index">
						<span>{{allergen}}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="user-description-container">
			<div class="user-info">
				<div class="pfp-container">
					<img class="pfp" :src="'data:image/' + user.pfpExt + ';base64,'+ user.pfp" alt="pfp" v-if="user.pfp" />
					<img class="pfp" src="/src/assets/default_pfp.png" alt="pfp" v-else>
				</div>
				<div class="user">
					<span class="username">{{user.username.length < 10 ? user.username : user.username.substring(0, 10) + '...' }}</span><br>
					<div class="recipe-count" v-show="user.recipeCount">Recipes: {{ user.recipeCount }}</div>
				</div>
			</div>
			<div class="description-container">
				<h3 class="description-title">Description</h3>
				<p>{{recipe.description}}</p>
			</div>
		</div>
		<div class="timestamp-container">
			<span class="uploded">Uploaded: {{formattedUploaded}}</span><br>
			<span class="last-modified" v-show="wasModified">Last modified: {{formattedLastModified}}</span>
		</div>
		<div class="ratings-header">
			<h3 class="ratings-text">Ratings ({{ratingCount}})</h3>
			<button class="rate-btn"
					data-bs-toggle="modal"
					data-bs-target="#comment-modal"
					v-show="userStore.loggedIn && user.id !== userStore.user?.id"
					v-if="!hasCommented">
					Rate this recipe
			</button>
			<button class="rate-btn"
					data-bs-toggle="modal"
					data-bs-target="#comment-modal"
					@click="initEditComment"
					v-show="userStore.loggedIn && user.id !== userStore.user?.id"
					v-else>
					Edit your rating
			</button>
		</div>
		<div class="average-rating-container">
			<div>
				<span class="average-rating-text">Average rating:</span>
			</div>
			<div class="stars-and-rating">
				<div class="stars rating-stars">
					<span class="star star-extra" :class="Math.round(rating) === 5 ? 'checked' : ''">☆</span>
					<span class="star star-five" :class="Math.round(rating) === 4 ? 'checked' : ''">☆</span>
					<span class="star star-four" :class="Math.round(rating) === 3 ? 'checked' : ''">☆</span>
					<span class="star star-three" :class="Math.round(rating) === 2 ? 'checked' : ''">☆</span>
					<span class="star star-two" :class="Math.round(rating) === 1 ? 'checked' : ''">☆</span>
					<span class="star star-one" >☆</span>
				</div>
				<span class="rating">{{rating ? rating.toFixed(2) : "-"}}</span>
			</div>
		</div>
		<div class="comments" v-if="comments.length !== 0">
			<hr>
			<div class="comment" v-for="(comment, index) in comments" :key="index">
				<Comment :comment="comment"/>
				<hr>
			</div>
		</div>
		<div class="no-comment" v-else>
			<span>There are no ratings yet</span>
		</div>
		<div class="my-pagination-container">
			<Pagination :total-items="ratingCount" :items-per-page="5" @change-page="initComments" v-show="rating"/>
		</div>
	</div>

	<div class="modal fade" id="favourite-modal" ref="favourite-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning" v-if="modalMode === 'remove'">
					<button id="favourite-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-favourite" v-if="modalMode === 'add'">
					<span class="favourite-added-text">Recipe added to favourites!</span>
					<label class="add-to-group-label" for="add-to-group">Add to group:</label><br/>
					<form class="add-to-group">
						<Multiselect class="add-to-group-input" name="add-to-group" v-model="selectedGroupInput" :options="userGroups" :searchable="true" :can-clear="false"/>
						<button class="add-to-group-button" type="button" @click="addToGroup">Add</button><br>
					</form>

					<hr class="form-divide"/>

					<label class="create-group-label" for="create-group-input">Create group and add recipe:</label><br/>
					<form class="create-group">
						<input class="create-group-input" type="text" id="create-group-input" autocomplete="off" v-model="createGroupInput">
						<button class="create-group-button" type="button" @click="createAndAddToGroup">Create</button><br>
					</form>

				</div>

				<div class="remove-favourite" v-if="modalMode === 'remove'">
					<span>Are you sure you want to delete this recipe from your favourites?</span><br>
					<button class="delete-btn" @click="removeFromFavourites">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>


			</div>
		</div>
	</div>

	<div class="modal modal-lg fade" id="comment-modal" ref="comment-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="comment-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<form class="comment-modal-container">
					<div class="rating-container">
						<span class="rating-text">Rating:</span>
						<div class="rating">
							<input type="radio" name="rating" value="5" id="5" v-model="newComment.rating"><label for="5">☆</label>
							<input type="radio" name="rating" value="4" id="4" v-model="newComment.rating"><label for="4">☆</label>
							<input type="radio" name="rating" value="3" id="3" v-model="newComment.rating"><label for="3">☆</label>
							<input type="radio" name="rating" value="2" id="2" v-model="newComment.rating"><label for="2">☆</label>
							<input type="radio" name="rating" value="1" id="1" v-model="newComment.rating"><label for="1">☆</label>
						</div>
					</div>
					<div class="comment-content-container">
						<label for="comment-content" class="content-text">Content:</label>
						<textarea class="comment-content-input" id="comment-content" maxlength="300" v-model="newComment.content"/>
						<span class="comment-content-counter">{{newComment.content.length}}/300</span>
					</div>
					<div class="comment-alert alert alert-danger" v-if="ratingErrors.length !== 0">
						<strong>Submit failed!</strong><br>
						<ul>
							<li class="comment-error-items" v-for="(error, index) in ratingErrors" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="submit-rating-btn-container">
						<button class="submit-rating-btn" type="button" @click="submitRating" v-if="!hasCommented">Submit rating</button>
						<button class="submit-rating-btn" type="button" @click="editRating" v-else>Edit rating</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="modal fade" id="shopping-list-modal" ref="shopping-list-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="shopping-list-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="shopping-list-modal-container">
					<div class="hopping-list-modal-text-container">
						<span class="shopping-list-modal-text">The items have been added to your shopping list!</span>
					</div>
					<button class="shopping-list-modal-button" type="button" data-bs-dismiss="modal">OK</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {Modal} from 'bootstrap'
import Multiselect from '@vueform/multiselect'
import Comment from '@/components/Comment.vue'
import Pagination from "@/components/Pagination.vue";
import {useUserStore} from "@/stores/userStore.js";
import {mapStores} from "pinia";

export default {
	name: "Recipe",

	components: {
		Multiselect,
		Comment,
		Pagination,
	},

	props: {
		recipeID: Number | String,
	},

	data(){
		return {
			recipe: {
				name: "",
				description: "",
				categories: [],
				timeHour: null,
				timeMinute: null,
				difficulty: "",
				cost: "",
				portions: null,
				calories: null,
				imageUrl: "",
				image: null,
				imageExt: "",
				uploaded: "",
				lastModified: "",
				steps: [],
				ingredients: [],
				diets: [],
				allergens: [],
			},

			rating: 0,
			ratingCount: 0,
			comments: [],

			user: {
				id: null,
				username: "",
				pfpUrl: "",
				pfp: "",
				pfpExt: "",
				recipeCount: null,
			},

			newComment: {
				rating: null,
				content: "",
			},

			userFavourite: false,
			modalMode: "",

			userGroups: {},

			selectedGroupInput: "",
			createGroupInput: "",

			categoriesStr: "",

			allChecked: false,
			selectedIngredients: [],

			wasModified: false,

			hasCommented: false,

			ratingErrors: [],

		}
	},

	created() {
		// watch the params of the route to fetch the data again
		this.$watch(
			() => this.$route.params,
			() => {
				this.initPage();
			},
			// fetch the data when the view is created and the data is
			// already being observed
			{ immediate: true }
		)
	},

	methods: {
		sortSteps(){
			this.recipe.steps.sort((a, b) => a.number - b.number);
		},

		joinCategoriesToString(){
			let categoryNames = [];

			for (let i = 0; i < this.recipe.categories.length; i++) {
				categoryNames.push(this.recipe.categories[i].name);
			}

			for (let i = 0; i < this.recipe.diets.length; i++) {
				categoryNames.push(this.recipe.diets[i]);
			}

			this.categoriesStr = categoryNames.join(" - ");
		},

		changeAll(){
			this.allChecked = !this.allChecked;

			if(this.allChecked){
				this.selectedIngredients = this.recipe.ingredients;
			} else {
				this.selectedIngredients = [];
			}
		},

		setWasModified(){
			if (this.recipe.uploaded !== this.recipe.lastModified) {
				this.wasModified = true;
			}
		},

		async initRecipe(){
			try {
				const response = await this.axios.get(`/recipe/recipeById/${this.recipeID}`);
				this.recipe.name = response.data.name;
				this.recipe.description = response.data.description;
				this.recipe.categories = response.data.categories;
				this.recipe.timeHour = response.data.hour;
				this.recipe.timeMinute = response.data.minute;
				this.recipe.difficulty = response.data.difficulty;
				this.recipe.cost = response.data.cost;
				this.recipe.portions = response.data.portions;
				this.recipe.calories = response.data.calories;
				this.recipe.imageUrl = response.data.photo;
				this.recipe.uploaded = response.data.uploaded;
				this.recipe.lastModified = response.data.lastModified;
				this.recipe.steps = response.data.steps;
				this.recipe.ingredients = response.data.ingredients;
				this.recipe.diets = response.data.diets;
				this.recipe.allergens = response.data.allergens;

				this.user.id = response.data.user.id;
				this.user.username = response.data.user.username;
				this.user.pfpUrl = response.data.user.profilepicture;

				this.joinCategoriesToString();
				this.sortSteps();
				this.setWasModified();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRecipeImage(){
			try {
				const response = await this.axios.get(`/recipe/recipeImage/${this.recipe.imageUrl}`);
				this.recipe.image = response.data;
				this.recipe.imageExt = this.recipe.imageUrl.split(".")[1];
			} catch (error) {
				console.log(error.response.data);
			}

		},

		async initUserPfp(){
			try {
				const response = await this.axios.get(`/user/pfp/${this.user.pfpUrl}`);
				this.user.pfp = response.data;
				this.user.pfpExt = this.user.pfpUrl.split(".")[1];
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRating(){
			try {
				const response = await this.axios.get(`/recipe/averageRating/${this.recipeID}`)
				this.rating = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRatingCount(){
			try {
				const response = await this.axios.get(`/recipe/commentCount/${this.recipeID}`)
				this.ratingCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initComments(page){
			try {
				const response = await this.axios.get(`/recipe/commentsByRecipeId/${this.recipeID}/${page}`)
				this.comments = response.data;

				for (let i = 0; i < this.comments.length; i++) {
					if(this.comments[i].user.profilepicture){
						try {
							const response = await this.axios.get(`/user/pfp/${this.comments[i].user.profilepicture}`);
							this.comments[i].user.pfpImage = response.data;
							this.comments[i].user.pfpExt = this.comments[i].user.profilepicture.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initUserRecipeCount(){
			try {
				const response = await this.axios.get(`/user/uploadedRecipeCount/${this.user.id}`)
				this.user.recipeCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initFavourite(){
			try {
				const response = await this.axios.get(`/favourite/allUserFavourites`)
				let userFavourites = response.data;
				if(userFavourites.includes(Number(this.recipeID))){
					this.userFavourite = true;
				} else {
					this.userFavourite = false;
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initGroups(){
			try {
				const response = await this.axios.get("/user/groups/allCurrentUser");
				for(const group of response.data){
					this.userGroups[group.id] = group.name;
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initHasCommented(){
			try {
				const response = await this.axios.get("/user/currentUserAllRecipesWithComments");
				if(response.data.includes(Number(this.recipeID))){
					this.hasCommented = true;
				} else {
					this.hasCommented = false;
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async addToFavourites(){
			try {
				await this.axios.get(`/favourite/add/${this.recipeID}`)
				await this.initFavourite();
			} catch (error) {
				console.log(error.response.data);
				throw error
			}
		},

		async removeFromFavourites(){
			try {
				await this.axios.get(`/favourite/delete/${this.recipeID}`);
				document.getElementById("favourite-close-button").click();
				await this.initFavourite();
			} catch (error) {
				console.log(error.response.data);
				throw error
			}
		},

		async addToGroup(){
			if(this.selectedGroupInput) {
				try {
					await this.axios.post("/user/groups/addRecipe", {
						groupId: Number(this.selectedGroupInput),
						recipeId: Number(this.recipeID),
					});

					document.getElementById("favourite-close-button").click();

				} catch (error) {
					console.log(error.response.data);
					throw error
				}
			}
		},

		async createAndAddToGroup(){
			if(this.createGroupInput.trim() !== ""){
				try {
					let response = await this.axios.post("/user/groups/createForCurrentUser", {
						name: this.createGroupInput
					});

					await this.axios.post("/user/groups/addRecipe", {
						groupId: Number(response.data.id),
						recipeId: Number(this.recipeID),
					});

					document.getElementById("favourite-close-button").click();

				} catch (error) {
					console.log(error.response.data);
					throw error
				}
			}
		},

		async addToShoppingList(){
			if(this.selectedIngredients.length > 0){
				let selectedIngredientsCopy = JSON.parse(JSON.stringify(this.selectedIngredients))

				for (let i = 0; i < selectedIngredientsCopy.length; i++) {
					delete selectedIngredientsCopy[i].unit;
				}

				try {
					await this.axios.post("/shoppingList/add/categoryAndItems", {
						categoryName: this.recipe.name,
						items: selectedIngredientsCopy,
					});

					let shoppingListModal = new Modal(document.getElementById("shopping-list-modal"), {});
					shoppingListModal.show();

					document.getElementById("check-all").checked = false;
					this.allChecked = false;
					this.selectedIngredients = [];
				} catch (error) {
					console.log(error.response.data);
					throw error
				}
			}
		},

		async submitRating(){
			this.ratingErrors = this.ratingInputsAreValid;
			if(this.ratingErrors.length === 0){
				try {
					await this.axios.post("/recipe/addComment", {
						content: this.newComment.content,
						rating: Number(this.newComment.rating),
						recipeId: Number(this.recipeID),
					});

					document.getElementById("comment-close-button").click();
					await this.initHasCommented();
					await this.initComments(1);
					await this.initRating();
					await this.initRatingCount()

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.ratingErrors.push(...error.response.data.errorMessage);
					} else {
						this.ratingErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async initEditComment(){
			try {
				const response = await this.axios.get(`/recipe/getCommentOfCurrentUserByRecipeId/${this.recipeID}`)
				this.newComment = response.data[0];
			} catch (error) {
				console.log(error.response.data);
			}
		},


		async initPage(){
			await this.initRecipe();
			if(this.recipe.imageUrl && this.recipe.imageUrl !== "default"){
				await this.initRecipeImage();
			}
			if(this.user.pfpUrl) {
				await this.initUserPfp();
			}

			if(this.userStore.loggedIn){
				await this.initFavourite();
				await this.initHasCommented();
			}

			await this.initRating();
			await this.initRatingCount();
			await this.initUserRecipeCount();
			await this.initComments(1);
		},

		async editRating(){
			this.ratingErrors = this.ratingInputsAreValid;
			if(this.ratingErrors.length === 0){
				try {
					await this.axios.post("/recipe/editComment", {
						id: Number(this.newComment.id),
						content: this.newComment.content,
						rating: Number(this.newComment.rating),
					});

					document.getElementById("comment-close-button").click();
					await this.initComments(1);
					await this.initRating();

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.ratingErrors.push(...error.response.data.errorMessage);
					} else {
						this.ratingErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async changeFavourites(){
			try {
				if(!this.userFavourite){

					await this.addToFavourites();

					this.modalMode = "add"
					let favouriteModal = new Modal(document.getElementById("favourite-modal"), {});
					favouriteModal.show();

					await this.initGroups();
				} else {
					this.modalMode = "remove"
					let favouriteModal = new Modal(document.getElementById("favourite-modal"), {});
					favouriteModal.show();
				}
			} catch (error) {
				console.log(error.response.data);
			}

		},

		clearFavouriteModal(){
			this.selectedGroupInput =  "";
			this.createGroupInput = "";
		},

		clearCommentModal(){
			this.newComment.rating = null;
			this.newComment.content = "";
			this.ratingErrors = [];
		},

		setModalHandlers() {
			const favouriteModal = document.getElementById('favourite-modal');
			favouriteModal.addEventListener("hidden.bs.modal", () => this.clearFavouriteModal());

			const commentModal = document.getElementById('comment-modal');
			commentModal.addEventListener("hidden.bs.modal", () => this.clearCommentModal());
		},
	},

	computed: {
		formattedUploaded(){
			return new Date(this.recipe.uploaded.split(" ")[0]).toLocaleDateString("en-GB");
		},

		formattedLastModified(){
			return new Date(this.recipe.lastModified.split(" ")[0]).toLocaleDateString("en-GB");
		},

		ratingInputsAreValid(){
			let errors = [];

			if(!this.newComment.rating){
				errors.push("Please rate the recipe.");
			} else if(this.newComment.rating < 1 || this.newComment.rating > 5) {
				errors.push("Rating must be between 1-5 stars.");
			}

			if(this.newComment.content?.trim().length > 300){
				errors.push("Content of comment can't be longer than 300 characters.");
			}

			return errors;
		},

		...mapStores(useUserStore),
	},

	watch : {
		'userStore.loggedIn'(loggedIn) {
			if(loggedIn) {
				this.initPage();
			}
		}
	},

	mounted() {
		this.setModalHandlers();
		//this.initPage();
	}
}
</script>

<style scoped lang="scss">

	.content {
		margin: 90px auto 140px auto;
		font-family: Gotu,serif;

		.recipe-header {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.recipe-title {
				margin-bottom: 0;
				max-width: 70%;
			}

			.rating {
				display: flex;
				align-items: center;

				.rating-count {
					margin-left: 10px;
				}
			}
		}

		.favourite-container {
			display: flex;
			width: 100%;
			justify-content: flex-end;

			.favourite-button {
				display: flex;
				align-items: center;
				background-color: white;
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 5px 30px;

				.heart-icon {
					height: 1.3rem;
					margin-right: 10px;
				}

				&.yellow {
					border: 1px solid var(--yellow);
				}
			}
		}

		.info-container {
			margin-top: 20px;
			border-top: 1px solid var(--lightgrey);
			border-bottom: 1px solid var(--lightgrey);
			padding: 30px 10px;

			.categories {
				display: block;
				width: 100%;
				text-align: center;
				margin-bottom: 17px;
			}

			.infos {
				display: flex;
				justify-content: space-evenly;

				.icon {
					height: 2rem;
					margin-right: 15px;
				}
			}
		}

		.column-container {
			display: flex;
			justify-content: space-between;
			gap: 50px;
			margin-top: 25px;

			.column-left {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 60%;
				//width: 32vw;
				min-width: 300px;

				.recipe-image-container {
					background-color: var(--lightgreen);
					width: 32vw;
					min-width: 300px;
					height: 20vw;
					min-height: 200px;
					border-radius: 20px;

					.recipe-image {
						width: 32vw;
						min-width: 300px;
						height: 20vw;
						min-height: 200px;
						object-fit: cover;
						border-radius: 20px;
					}
				}

				.steps-header-container {
					margin-top: 35px;
					border-top: 1px solid var(--lightgrey);
					border-bottom: 1px solid var(--lightgrey);
					padding: 20px 0 20px 20px;
					width: 100%;

					.steps-header {
						display: block;
						margin: 0;

					}
				}

				.steps-container {
					display: flex;
					flex-direction: column;
					padding: 40px 25px;
					border-bottom: 1px solid var(--lightgrey);
					width: 100%;

					.step-container {
						display: flex;
						align-items: center;
						margin-bottom: 5px;
						padding: 10px;


						&:hover {
							background-color: var(--verylightgrey);
							cursor: default;
						}

						.number-container {
							margin-right: 20px;
							padding: 5px 10px 3px 10px;
							border-radius: 10px;
							background-color: var(--lightyellow);
						}

						.content-container {

							.content {
								margin: 0;
							}
						}
					}
				}
			}
			.column-right {
				width: 40%;
				//width: 27vw;
				display: flex;
				flex-direction: column;
				align-items: center;

				.ingredients-container {
					background-color: var(--lightgreen);
					width: 100%;
					border-radius: 20px;
					border: 1px solid var(--lightgrey);
					padding-bottom: 20px;

					form {
						display: flex;
						flex-direction: column;
					}

					.ingredients-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						background-color: var(--darkgreen);
						padding: 25px 40px 15px 40px;
						border-top-left-radius: 20px;
						border-top-right-radius: 20px;

						.ingredients-header-text {
							margin: 0;
						}

						.check-all-container {
							display: flex;
							align-items: flex-start;

							label {
								font-size: 20px;
							}

							input.check-all {
								margin-left: 10px;
								width: 25px;
								height: 25px;
								accent-color: var(--yellow);

								 &:hover {
									 cursor: pointer;
								 }
							}

						}
					}

					.ingredient-list-container {
						padding: 20px 40px 0 40px;

						.ingredient {
							display: flex;
							justify-content: space-between;
							margin-bottom: 20px;

							label {

							}

							.checkbox-input {
								width: 25px;
								height: 25px;
								min-width: 25px;
								min-height: 25px;
								accent-color: var(--yellow);
								margin-left: 10px;

								&:hover {
									cursor: pointer;
								}
							}
						}
					}

					.add-shoppinglist-btn {
						align-self: center;
						background-color: var(--yellow);
						border: 1px solid var(--lightgrey);
						border-radius: 20px;
						padding: 5px 30px;
					}
				}

				.allergens-header {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					background-color: var(--yellow);
					font-size: 1.5rem;
					padding: 20px;
					margin-top: 25px;
					border-radius: 20px;

					.warning-icon {
						width: 50px;
						margin-right: 20px;
					}
				}

				.allergens {
					width: 90%;
					display: flex;
					flex-wrap: wrap;
					gap: 15px;
					margin-top: 17px;

					.allergen {
						display: inline-block;
						background-color: var(--lightgreen);
						border-radius: 20px;
						border: 1px solid var(--lightgrey);
						padding: 5px 20px;
					}
				}
			}
		}

		.user-description-container {
			display: flex;
			margin-top: 70px;

			.user-info {
				display: flex;
				align-items: center;
				background-color: var(--darkgreen);
				padding: 5% 3%;
				flex-grow: 1;

				.pfp-container {
					display: flex;
					justify-content: center;
					align-items: center;

					width: 150px;
					height: 150px;

					background-color: white;
					border-radius: 100px;

					.pfp {
						width: 150px;
						height: 150px;

						object-fit: cover;
						border-radius: 100px;
						border: solid 5px white;
					}
				}

				.user {
					margin-left: 15px;

					.username {
						font-size: 2rem;
					}

					.recipe-count {
						font-size: 0.9rem;
						white-space: nowrap;
					}
				}

			}

			.description-container {
				background-color: var(--lightgreen);
				padding: 5% 3%;
				flex-grow: 4;

				.description-title {
					margin-bottom: 30px;
				}
			}
		}

		.timestamp-container {
			margin-top: 10px;
			text-align: right;
			color: var(--lightgrey);
			font-size: 0.9rem;
		}

		.ratings-header {
			display: flex;
			justify-content: space-between;
			margin-top: 75px;

			.rate-btn {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 5px 30px;
			}
		}

		.average-rating-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: var(--verylightgrey);
			padding: 1% 3%;
			margin-top: 30px;
			font-size: 1.5rem;

			.stars-and-rating {
				display: flex;
				align-items: center;
				gap: 20px;

				.rating {
					font-size: 1.8rem;
				}

				.stars > span {
					color: white;
				}

				.stars > span.checked ~ span:before{
					color: var(--yellow);
				}


			}
		}

		.no-comment {
			text-align: center;
			margin-top: 20px;
			font-size: 1.2rem;
		}

		.my-pagination-container {
			display: flex;
			justify-content: right;
			margin-top: 40px;
		}
	}


	.stars {
		display: flex;
		flex-direction: row-reverse;
		justify-content: center;
	}

	.stars > span {
		position: relative;
		width: 0.8em;
		font-size: 40px;
		color: var(--yellow);
	}

	.stars > span::before{
		color: var(--yellow);
		content: "\2605";
		position: absolute;
		opacity: 0;
	}

	.stars > span.checked ~ span:before{
		opacity:1;
	}

	.star-extra{
		display: none;
	}

	.modal {
		margin-top: 70px;
	}

	.modal-header {
		border-bottom: none;

		.warning-icon {
			height: 40px;
			margin-top: -50px;
			margin-left: -27px;
			z-index: 1100;
		}
	}

	.add-favourite {
		margin: 0 10% 30px 10%;
		font-family: Gotu,serif;

		.favourite-added-text {
			display: block;
			text-align: center;
			font-size: 20px;
		}

		.add-to-group-label {
			margin-top: 20px;
			margin-bottom: 5px;
		}

		.add-to-group {
			display: flex;
			align-items: center;
			margin-bottom: 20px;

			.add-to-group-input {
				width: 70%;
				margin: 0;
				border-radius: 10px;
				border-color: transparent;
				min-height: 0;
				height: 2rem;
				padding: 15px 9px;

				&:focus {
					outline: var(--lightgreen) solid 3px;
				}
			}

			.add-to-group-button {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 3px 0;
				width: 25%;
				margin-left: auto;
				margin-right: auto;

				&:hover {
					opacity: 0.8;
				}
			}
		}

		.form-divide {
			margin-top: 25px;
			margin-bottom: 25px;
		}

		.create-group-label{
			margin-bottom: 5px;
		}

		.create-group {
			display: flex;
			align-items: center;
			margin-bottom: 20px;

			.create-group-input {
				width: 70%;
				margin: 0;
				border-radius: 10px;
				border-color: transparent;
				height: 2rem;
				padding: 15px 12px;

				&:focus {
					outline: var(--lightgreen) solid 3px;
				}
			}

			.create-group-button {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 3px 0;
				width: 25%;
				margin-left: auto;
				margin-right: auto;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.remove-favourite {
		margin: 0 10% 30px 10%;
		font-family: Gotu,serif;
		text-align: center;

		.delete-btn, .cancel-btn {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;

			&:hover {
				opacity: 0.8;
			}
		}

		.delete-btn {
			background-color: var(--yellow);
			margin-right: 40px;
		}

		.cancel-btn {
			background-color: var(--lightgreen);
		}
	}


	.comment-modal-container {
		margin: 0 10% 30px 10%;
		font-size: 1.2rem;
		font-family: Gotu,serif;

		.rating-container {
			display: flex;
			align-items: center;

			.rating-text {
				margin-right: 20px;
			}

			.rating {
				display: flex;
				flex-direction: row-reverse;
				justify-content: center;
			}


			.rating > input{ display:none;}

			.rating > label {
				position: relative;
				width: 1.1em;
				font-size: 40px;
				content: "\2605";
				color: white;
				cursor: pointer;
			}

			.rating > label::before{
				content: "\2605";
				position: absolute;
				opacity: 0;
			}

			.rating > label:hover:before,
			.rating > label:hover ~ label:before {
				color: var(--yellow);
				opacity: 1 !important;
			}

			.rating > input:checked ~ label:before{
				color: var(--yellow);
				opacity:1;
			}

			.rating:hover > input:checked ~ label:before{ opacity: 0.4; }
		}


		.comment-content-container {
			display: flex;
			flex-direction: column;

			.comment-content-input {
				width: 100%;
				resize: none;
				border-radius: 10px;
				border-color: transparent;
				padding: 15px;
				font-size: 1rem;
				font-family: Gotu,serif;
				margin-top: 10px;
				margin-bottom: 10px;
				height: 10vh;

				&:focus {
					outline: var(--lightgreen) solid 3px;
				}
			}

			.comment-content-counter {
				width: 100%;
				text-align: right;
				font-family: Gotu,serif;
				margin-bottom: 25px;
				font-size: 0.95rem;
			}
		}

		.submit-rating-btn-container {
			display: flex;
			justify-content: center;

			.submit-rating-btn {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 15px;
				padding: 5px 30px;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.alert {
		width: 100%;

		.comment-error-items {
			font-size: 0.8rem;
		}

		&.comment-alert {
			padding-bottom: 5px;
		}
	}

	.shopping-list-modal-container {
		margin: 0 10% 30px 10%;
		font-family: Gotu,serif;
		text-align: center;

		.shopping-list-modal-button {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;
			background-color: var(--yellow);

			&:hover {
				opacity: 0.8;
			}
		}
	}

</style>