<!-- User's "Don't recommend" recipes page -->

<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<h2 class="dont-recommend-title">'Dont recommend' recipes</h2>
		<div class="dont-recommend-recipes-container">
			<div class="recipe-card-container" v-for="(recipe, index) in recipeCards" :key="index">
				<MinimalRecipeCard :id="recipe.id"
								   :name="recipe.name"
								   :uploaded="recipe.uploaded"
								   :photo="recipe.photoImage"
								   :photo-ext="recipe.photoExt"
								   page="dontRecommend"
								   @delete="openDeleteRecipeModal"
				/>
			</div>

			<span class="no-recipe-text" v-show="recipeCards.length === 0">There are no recipes to display.</span>
			<div class="pagination-container">
				<Pagination :total-items="recipeCardsCount" :items-per-page="10" :white="true" @change-page="initRecipeCards"/>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-recipe-modal" ref="delete-recipe-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-recipe-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-recipe">
					<span>Are you sure you want to remove recipe from your recipes not to recommend? After that, this recipe will be recommended to you in the future again.</span><br>
					<button class="delete-btn" @click="deleteRecipe">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import MinimalRecipeCard from "@/components/MinimalRecipeCard.vue";
import Pagination from "@/components/Pagination.vue";
import {Modal} from "bootstrap";

export default {
	name: "DontRecommendRecipes",
	components: {Pagination, MinimalRecipeCard},
	beforeRouteEnter,

	data(){
		return {
			recipeCards: [],
			recipeCardsCount: 0,
			currentPage: 1,
			deleteId: null,
		}
	},

	methods: {
		/**
		 * Initializes the recipe cards for user's "Don't recommend" recipes list.
		 * @param page page to get
		 */
		async initRecipeCards(page){
			try {
				const response = await this.axios.get(`/weeklyMenu/dontRecommend/allRecipeCards/${page}`);
				this.recipeCards = response.data;
				this.currentPage = page;

				// get recipe images
				for (let i = 0; i < this.recipeCards.length; i++) {
					if(this.recipeCards[i].photo && this.recipeCards[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.recipeCards[i].photo}`);
							this.recipeCards[i].photoImage = response.data;
							this.recipeCards[i].photoExt = this.recipeCards[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes the number of all "Don't recommend" recipes of user.
		 * @returns {Promise<void>}
		 */
		async initRecipeCardsCount(){
			try {
				const response = await this.axios.get(`/weeklyMenu/dontRecommend/count/allRecipeCards`);
				this.recipeCardsCount = response.data;
			} catch (error) {
				console.log(error.response.data);

			}
		},

		/**
		 * Removes recipe from user's "Don't recommend" recipes list.
		 */
		async deleteRecipe(){
			try {
				await this.axios.get(`/weeklyMenu/dontRecommend/delete/${this.deleteId}`);
				document.getElementById("delete-recipe-close-button").click();
				await this.initRecipeCardsCount();

				// check if after delete the current page still exists, if not, navigate to previous one
				if(!this.currentPageExists){
					this.currentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.currentPage)){
							paginateButtons[i].click();
						}
					}
				}

				await this.initRecipeCards(this.currentPage);
				this.deleteId = null;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openDeleteRecipeModal(recipeId){
			let deleteRecipeModal = new Modal(document.getElementById("delete-recipe-modal"), {});
			deleteRecipeModal.show();

			this.deleteId = recipeId;
		},
	},

	computed: {
		/**
		 * Does the current page of the "Don't recommend" recipes list exists based on the recipe count and page size.
		 * @returns true if page exists
		 */
		currentPageExists(){
			let lastPage = Math.ceil(this.recipeCardsCount / 10)

			return this.currentPage <= lastPage;
		},
	},

	mounted() {
		this.initRecipeCardsCount();
		this.initRecipeCards(1);
	}
}
</script>

<style scoped lang="scss">
.content {
	margin: 80px auto 140px auto;
	font-family: Gotu, serif;

	.dont-recommend-recipes-container {
		background-color: var(--lightgreen);
		border-radius: 20px;
		padding: 30px 5% 40px;
		margin-top: 30px;

		.recipe-card-container {
			margin-bottom: 15px;
		}

		.no-recipe-text {
			display: block;
			text-align: center;
			color: var(--mediumgrey);
			margin-top: 50px;
		}

		.pagination-container {
			display: flex;
			justify-content: center;
			margin-top: 70px;

			ul {
				margin-top: 0;
			}
		}

	}
}

.modal {
	font-family: Gotu, serif;
	margin-top: 70px;

	.modal-header {
		border-bottom: none;

		.warning-icon {
			height: 40px;
			margin-top: -50px;
			margin-left: -27px;
			z-index: 1100;
		}
	}
}

.delete-recipe {
	margin: 0 10% 30px 10%;
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

@media screen and (max-width: 575px){
	.content {
		margin-left: 10px;
		margin-right: 10px;
	}
}

@media (hover: none) {
	.modal-header {
		.warning-icon {
			display: none !important;
		}
	}

	.modal {
		margin-top: 0;
	}
}
</style>