<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="RecipesAdmin"/>
		</div>
		<div class="main-container">
			<div class="filters-container">
				<div class="left">
					<Multiselect class="search-by-multiselect" v-model="selectedSearchBy" :options="searchByOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
					<div class="searchbar-container">
						<input class="searchbar" type="text" v-model="searchTerm" :placeholder="searchbarPlaceholder" @keydown.enter="searchForRecipe">
						<button type="button" class="search-button" @click="searchForRecipe">
							<img class="search-icon" src="@/assets/icons/magnifying-glass_white.png" alt="Search">
						</button>
					</div>
				</div>
				<div class="right">
					<label class="sort-label" for="sort-input">Sort by:</label>
					<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypeOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
				</div>
			</div>
			<div class="recipes-table-container">
				<table class="recipes-table">
					<tr class="header-row">
						<th class="first-header id-th">ID</th>
						<th class="name-th">Name</th>
						<th class="uploaded-th">Uploaded</th>
						<th class="last-modified-th">Last modified</th>
						<th class="last-header uploaded-by-th" colspan="2">Uploaded by</th>
					</tr>
					<tr v-for="(recipe, index) in recipes" :key="index">
						<td class="id-td">{{recipe.id}}</td>
						<td class="name-td">{{recipe.name}}</td>
						<td class="uploaded-td">{{new Date(recipe.uploaded.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
						<td class="last-modified-td">{{new Date(recipe.lastModified.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
						<td class="uploaded-by-td">{{recipe.user.length < 30 ? recipe.user : recipe.user.substring(0, 30) + '...' }}</td>

						<td class="options-icon-cell">
							<button class="options-btn" :id="'options-icon' + index" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="20, 10">
								<img class="options-icon" src="@/assets/icons/dots_grey.png" alt="options-icon"/>
							</button>
							<ul class="dropdown-menu dropdown-menu-end options-dropdown" :aria-labelledby="'options-icon' + index">
								<li class="dropdown-item" @click="navigateToRecipePage(recipe.id)">
									<img class="go-to-page-icon icon" src="@/assets/icons/arrow-right.png" alt="arrow">
									Go to recipe page
								</li>
								<li class="dropdown-item" @click="navigateToEditRecipe(recipe.id)">
									<img class="edit-icon icon" src="@/assets/icons/edit.png" alt="edit">
									Edit
								</li>
								<li class="dropdown-item" @click="openDeleteRecipeModal(recipe.id)">
									<img class="delete-icon icon" src="@/assets/icons/bin.png" alt="delete">
									Delete
								</li>
							</ul>
						</td>
					</tr>
				</table>
				<p class="no-results-text" v-if="recipesCount === 0">No results</p>
			</div>
			<div class="pagination-container">
				<Pagination :total-items="recipesCount" :items-per-page="25" @change-page="initRecipes" v-if="recipes.length > 0"/>
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
					<span>Are you sure you want to delete this recipe?</span><br>

					<div class="delete-recipe-alert alert alert-danger" v-if="deleteRecipeErrors.length !== 0">
						<strong>Error!</strong><br>
						<ul>
							<li class="delete-recipe-error-items" v-for="(error, index) in deleteRecipeErrors" :key="index">{{error}}</li>
						</ul>
					</div>

					<button class="action-btn" @click="deleteRecipe">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
import Multiselect from '@vueform/multiselect';
import Pagination from "@/components/Pagination.vue";
import Loader from "@/components/Loader.vue";
import {Modal} from "bootstrap";

export default {
	name: "RecipesAdmin",
	beforeRouteEnter,

	components: {
		Loader,
		Pagination,
		AdminNavbar,
		Multiselect
	},

	data() {
		return {
			selectedSearchBy: "id",
			searchByOptions: {
				id: "ID",
				name: "Name",
				username: "Username"
			},

			searchTerm: "",

			selectedSortType: "idDesc",
			sortTypeOptions: {
				idAsc: "ID &#8593",
				idDesc: "ID &#8595",
				nameAsc: "Name &#8593",
				nameDesc: "Name &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
				lastModifiedAsc: "Last modified &#8593",
				lastModifiedDesc: "Last modified &#8595",
				usernameAsc: "Username &#8593",
				usernameDesc: "Username &#8595",
			},

			recipes: [],
			recipesCount: 0,

			currentPage: 1,
			currentRecipeId: null,

			deleteRecipeErrors: [],
		}
	},

	methods: {
		async initRecipesCount(){
			try {
				const response = await this.axios.post(`/recipe/admin/all/count`, this.searchObj)
				this.recipesCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRecipes(page){
			try {
				const response = await this.axios.post(`/recipe/admin/all/${this.selectedSortType}/${page}`, this.searchObj);
				this.recipes = response.data;
				this.currentPage = page;
			} catch (error) {
				console.log(error.response.data);

			}
		},

		async deleteRecipe(){
			try {
				await this.axios.get(`/recipe/admin/delete/${this.currentRecipeId}`);
				document.getElementById("delete-recipe-close-button").click();

				await this.initRecipesCount();

				if(!this.currentRecipesPageExists){
					this.currentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.currentPage)){
							paginateButtons[i].click();
						}
					}
				}

				await this.initRecipes(this.currentPage);

			} catch (error) {
				if (Array.isArray(error.response.data.errorMessage)) {
					this.deleteRecipeErrors.push(...error.response.data.errorMessage);
				} else {
					this.deleteRecipeErrors.push(error.response.data.errorMessage);
				}
			}
		},

		searchForRecipe(){
			this.initRecipes(1);
			this.initRecipesCount();
			this.currentPage = 1;

			let paginateButtons = document.getElementsByClassName("paginate-buttons");

			for (let i = 0; i < paginateButtons.length; i++) {
				if(paginateButtons[i].innerHTML === "1"){
					paginateButtons[i].click();
				}
			}
		},

		navigateToRecipePage(recipeId){
			window.scrollTo(0,0);
			this.$router.push({path: `/recipe/${recipeId}`});
		},

		navigateToEditRecipe(recipeId){
			window.scrollTo(0,0);
			this.$router.push({path: `/upload_recipe/${recipeId}`});
		},

		openDeleteRecipeModal(recipeId){
			let deleteRecipeModal = new Modal(document.getElementById("delete-recipe-modal"), {});
			deleteRecipeModal.show();

			this.currentRecipeId = recipeId;
		},

		clearDeleteRecipeModal(){
			this.deleteRecipeErrors = [];
			this.currentRecipeId = null;
		},

		setModalHandlers(){
			const deleteRecipeModal = document.getElementById('delete-recipe-modal');
			deleteRecipeModal.addEventListener("hidden.bs.modal", () => this.clearDeleteRecipeModal());
		},
	},

	computed: {
		searchbarPlaceholder(){
			let placeholder = "Search by ";

			switch (this.selectedSearchBy){
				case "id": placeholder = placeholder.concat("ID..."); break;
				case "name": placeholder = placeholder.concat("name..."); break;
				case "username": placeholder = placeholder.concat("username..."); break;
			}

			return placeholder;
		},

		searchObj(){
			let searchObj = {};

			searchObj.id = "";
			searchObj.name = "";
			searchObj.username = "";

			searchObj[this.selectedSearchBy] = this.searchTerm;

			return searchObj;
		},

		currentRecipesPageExists(){
			let lastPage = Math.ceil(this.recipesCount / 25);

			return this.currentPage <= lastPage;
		},
	},

	watch: {
		'selectedSortType'(){
			this.initRecipes(this.currentPage);
		}
	},

	mounted() {
		this.initRecipesCount();
		this.initRecipes(1);
		this.setModalHandlers();
	}
}
</script>

<style scoped lang="scss">
.content {
	margin: 60px auto 140px auto;
	font-family: Gotu, serif;
	display: flex;

	.admin-navbar-container {
		width: 20%;
	}

	.main-container {
		width: 76%;
		margin-left: 4%;

		.filters-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;

			.left, .right {
				display: flex;
				gap: 20px;

				.search-by-multiselect {
					width: 160px;
					border-radius: 10px;
				}

				.searchbar-container {
					display: flex;

					.searchbar {
						width: 300px;
						border-left: solid 1px var(--lightgrey);
						border-top: solid 1px var(--lightgrey);
						border-bottom: solid 1px var(--lightgrey);
						border-right: none;
						border-top-left-radius: 10px;
						border-bottom-left-radius: 10px;
						padding-left: 20px;
						padding-right: 20px;

						&:focus {
							outline: none;
						}

					}

					.search-button {
						width: 50px;
						height: 3rem;
						border-left: none;
						border-radius: 0 10px 10px 0;
						border-right: solid 1px var(--lightgrey);
						border-top: solid 1px var(--lightgrey);
						border-bottom: solid 1px var(--lightgrey);
						background-color: var(--yellow);

						display: flex;
						align-items: center;
						justify-content: center;

						margin-left: -20px;

						&:hover {
							box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
						}

						.search-icon{
							width: 20px;
						}
					}
				}

				.sort-label {
					white-space: nowrap;
				}

				.sort-input {
					width: 180px;
					border-radius: 10px;
				}
			}

			.right {
				align-items: center;
			}
		}

		.recipes-table-container {

			.recipes-table {
				width: 100%;

				.header-row {
					background-color: var(--darkgreen);

					.first-header {
						border-top-left-radius: 10px;
					}

					.last-header {
						border-top-right-radius: 10px;
					}

					&:hover {
						background-color: var(--darkgreen);
					}
				}

				td {
					border-top: solid 1px var(--verylightgrey);
					border-bottom: solid 1px var(--verylightgrey);
					border-collapse: collapse;

				}

				.uploaded-by-td {
					word-break: break-all;
				}

				th, td {
					padding: 15px 10px;
				}

				tr {
					height: 65px;

					&:hover {
						background-color: var(--verylightgrey);

						.options-btn {
							.options-icon {
								display: block;
							}
						}
					}
				}

				.options-icon-cell {
					width: 40px;

					.options-btn {
						padding: 0;
						background-color: transparent;
						border: none;
						width: 20px;

						.options-icon {
							display: none;
						}
					}

					.options-icon {
						width: 20px;

						&:hover {
							cursor: pointer;
							opacity: 0.8;
						}
					}

					.options-dropdown {
						background-color: var(--lightgreen);
						padding: 20px;
						border-radius: 20px;
						border-color: transparent;
						box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
						-webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
						-moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);

						.icon {
							height: 1.3rem;
							margin-right: 5%;
						}

						.dropdown-item{
							margin-bottom: 5%;
							border-radius: 10px;
							padding: 5px 30px 5px 25px;

							&:hover {
								background-color: var(--darkgreen);
								cursor: pointer;
							}

							&:active {
								color: black;
							}

							&:last-child {
								margin-bottom: 0;
							}
						}
					}

					//.dropdown-menu::before {
					//	border-bottom: 12px solid rgba(0, 0, 0, 0.2);
					//	border-left: 12px solid rgba(0, 0, 0, 0);
					//	border-right: 12px solid rgba(0, 0, 0, 0);
					//	content: "";
					//	display: inline-block;
					//	left: 218px;
					//	position: absolute;
					//	top: -10px;
					//}
					//.dropdown-menu::after {
					//	border-bottom: 12px solid var(--lightgreen);
					//	border-left: 12px solid rgba(0, 0, 0, 0);
					//	border-right: 12px solid rgba(0, 0, 0, 0);
					//	content: "";
					//	display: inline-block;
					//	left: 218px;
					//	position: absolute;
					//	top: -10px;
					//}
				}
			}

			.no-results-text {
				color: var(--mediumgrey);
				text-align: center;
				margin-top: 20px;
			}
		}

		.pagination-container {
			display: flex;
			justify-content: center;
			margin-top: 30px;
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

	.modal-body {
		margin: 0 10% 40px 10%;

		.warning {
			font-size: 13px;
			text-align: left;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 15px;
			margin-top: 20px;
			font-weight: bold;
		}

		.warning-text {
			color: var(--warning);
			text-align: left;
		}

		.warning-icon {
			height: 40px;
		}
	}

	.alert {
		width: 100%;
		text-align: left;

		.delete-recipe-error-items {
			font-size: 0.8rem;
		}

		&.delete-recipe-alert {
			padding-bottom: 5px;
		}
	}
}

.delete-recipe {
	margin: 0 10% 30px 10%;
	text-align: center;

	.action-btn, .cancel-btn {
		border: 1px solid var(--lightgrey);
		border-radius: 20px;
		padding: 5px 30px;
		margin-top: 15px;

		&:hover {
			opacity: 0.8;
		}
	}

	.action-btn {
		background-color: var(--yellow);
		margin-right: 40px;
	}

	.cancel-btn {
		background-color: var(--lightgreen);
	}

	.delete-recipe-alert {
		margin-top: 10px;
	}
}

@media screen and (max-width: 1580px) {
	.filters-container {
		flex-direction: column;
		gap: 10px;

		.left, .right {
			width: 100%;

			.search-by-multiselect, .sort-input {
				margin: 0;
			}
		}
	}
}

@media screen and (max-width: 785px){
	.content {
		flex-direction: column;

		.admin-navbar-container {
			width: 100%;
			margin-bottom: 30px;
		}

		.main-container {
			width: 100%;
			margin-left: 0;

			.left {
				flex-direction: column;
				gap: 10px !important;
			}
		}
	}
}

@media screen and (max-width: 575px){
	.content {
		margin-left: 10px;
		margin-right: 10px;
	}
}

@media screen and (max-width: 520px){
	.last-modified-th, .last-modified-td, .uploaded-th, .uploaded-by-td {
		display: none;
	}
}

@media (hover: none) {
	.options-icon {
		display: block !important;
	}

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