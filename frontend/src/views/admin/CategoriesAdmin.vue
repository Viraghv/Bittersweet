<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="CategoriesAdmin"/>
		</div>
		<div class="main-container">
			<div class="all-container">
				<div class="searchbar-container">
					<input class="searchbar-input" type="text" v-model="searchTerm" placeholder="Search...">
				</div>
				<div class="categories-container">
					<SelectablesRow mode="add" type="category" @add="openAddCategoryModal"/>
					<SelectablesRow type="category" v-for="(category, index) in categories" :key="index"
									:id="category.id" :name="category.name"
									v-show="category.name.includes(searchTerm)"
									@edit="openEditCategoryModal" @delete="openDeleteCategoryModal"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="add-category-modal" ref="add-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-category">
					<label class="add-category-label" for="add-category">Category name:</label>
					<div class="add-category-form">
						<input class="add-category-input" name="add-category" v-model="newCategoryName"/>

						<div class="add-category-alert alert alert-danger" v-if="newCategoryErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="add-category-error-items" v-for="(error, index) in newCategoryErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="add-category-button" type="button" @click="addCategory">Add</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-category-modal" ref="edit-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-category">
					<label class="edit-category-label" for="edit-category">Category name:</label>
					<div class="edit-category-form">
						<input class="edit-category-input" name="edit-category" v-model="newCategoryName"/>

						<div class="edit-category-alert alert alert-danger" v-if="newCategoryErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-category-error-items" v-for="(error, index) in newCategoryErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-category-button" type="button" @click="editCategory">Rename category</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-category-modal" ref="delete-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-category">
					<span>Are you sure you want to delete this category?</span><br>
					<button class="delete-btn" @click="deleteCategory">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
import {Modal} from "bootstrap";
import SelectablesRow from "@/components/SelectablesRow.vue";

export default {
	name: "CategoriesAdmin",
	beforeRouteEnter,

	components: {
		SelectablesRow,
		AdminNavbar,
	},

	data(){
		return {
			searchTerm: "",
			categories: [],

			newCategoryName: "",
			newCategoryErrors: [],

			currentCategoryId: null,
		}
	},

	methods: {
		async initCategories(){
			try {
				let response = await this.axios.get(`/recipe/categories`);

				response.data.sort((a, b) => {
					let textA = a.name.toUpperCase();
					let textB = b.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				this.categories = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async addCategory(){
			this.newCategoryErrors = this.categoryInputsAreValid;

			if(this.newCategoryErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/categories/add`, {
						name: this.newCategoryName.trim(),
					});

					document.getElementById("add-category-close-button").click();
					await this.initCategories();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newCategoryErrors.push(...error.response.data.errorMessage);
					} else {
						this.newCategoryErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async editCategory(){
			this.newCategoryErrors = this.categoryInputsAreValid;

			if(this.newCategoryErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/categories/edit/${this.currentCategoryId}`, {
						name: this.newCategoryName.trim(),
					});

					document.getElementById("edit-category-close-button").click();
					await this.initCategories();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newCategoryErrors.push(...error.response.data.errorMessage);
					} else {
						this.newCategoryErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async deleteCategory(){
			try {
				await this.axios.get(`/recipe/admin/categories/delete/${this.currentCategoryId}`);

				document.getElementById("delete-category-close-button").click();
				await this.initCategories();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openAddCategoryModal(){
			let addCategoryModal = new Modal(document.getElementById("add-category-modal"), {});
			addCategoryModal.show();
		},

		openEditCategoryModal(categoryId, categoryName){
			let editCategoryModal = new Modal(document.getElementById("edit-category-modal"), {});
			editCategoryModal.show();

			this.newCategoryName = categoryName;
			this.currentCategoryId = categoryId;
		},

		openDeleteCategoryModal(categoryId){
			let deleteCategoryModal = new Modal(document.getElementById("delete-category-modal"), {});
			deleteCategoryModal.show();

			this.currentCategoryId = categoryId;
		},

		clearAddCategoryModal(){
			this.newCategoryName = "";
			this.newCategoryErrors = [];
		},

		clearEditCategoryModal(){
			this.newCategoryName = "";
			this.newCategoryErrors = [];
			this.currentCategoryId = null;
		},

		clearDeleteCategoryModal(){
			this.currentCategoryId = null;
		},

		setModalHandlers(){
			const addCategoryModal = document.getElementById('add-category-modal');
			addCategoryModal.addEventListener("hidden.bs.modal", () => this.clearAddCategoryModal());

			const editCategoryModal = document.getElementById('edit-category-modal');
			editCategoryModal.addEventListener("hidden.bs.modal", () => this.clearEditCategoryModal());

			const deleteCategoryModal = document.getElementById('delete-category-modal');
			deleteCategoryModal.addEventListener("hidden.bs.modal", () => this.clearDeleteCategoryModal());
		},
	},

	computed: {
		categoryInputsAreValid(){
			let errors = [];

			if(this.newCategoryName.trim() === ""){
				errors.push("Please provide a name for the category.");

			}

			if(this.newCategoryName.trim().length > 50){
				errors.push("Category name can't be longer than 50 characters.");
			}

			return errors;
		}
	},

	mounted() {
		this.initCategories();
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

		.all-container {
			max-width: 600px;
			margin-left: auto;
			margin-right: auto;

			.searchbar-container {

				.searchbar-input {
					display: block;
					width: 100%;

					border: solid 1px var(--lightgrey);
					border-radius: 10px;
					padding: 10px 20px;

					&:focus {
						outline: none;
					}
				}
			}

			.categories-container {
				margin-top: 30px;
				display: flex;
				flex-direction: column;
				gap: 10px;
			}
		}
	}
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

.add-category, .edit-category {
	text-align: left;
	display: flex;
	flex-direction: column;
	margin: 0 10% 10px 10%;
	font-family: Gotu, serif;

	.add-category-form, .edit-category-form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.add-category-input, .edit-category-input {
		width: 100%;
		margin-top: 1%;
		margin-bottom: 4%;
		border-radius: 10px;
		border-width: 1px;
		border-color: var(--lightgrey);
		padding: 5px 10px;

		&:focus {
			outline: var(--darkestgreen) solid 3px;
		}
	}

	.add-category-button, .edit-category-button {
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

.delete-category {
	margin: 0 10% 30px 10%;
	font-family: Gotu, serif;
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

.alert {
	width: 100%;
	padding-bottom: 5px;

	.add-category-error-items, .edit-category-error-items {
		font-size: 0.8rem;
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
		}
	}
}
</style>