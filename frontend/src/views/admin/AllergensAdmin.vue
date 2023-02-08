<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="AllergensAdmin"/>
		</div>
		<div class="main-container">
			<div class="all-container">
				<div class="searchbar-container">
					<input class="searchbar-input" type="text" v-model="searchTerm" placeholder="Search...">
				</div>
				<div class="allergens-container">
					<SelectablesRow mode="add" type="allergen" @add="openAddAllergenModal"/>
					<SelectablesRow type="allergen" v-for="(allergen, index) in allergens" :key="index"
									:id="allergen.id" :name="allergen.name"
									v-show="allergen.name.includes(searchTerm)"
									@edit="openEditAllergenModal" @delete="openDeleteAllergenModal"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="add-allergen-modal" ref="add-allergen-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-allergen-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-allergen">
					<label class="add-allergen-label" for="add-allergen">Allergen name:</label>
					<div class="add-allergen-form">
						<input class="add-allergen-input" name="add-allergen" v-model="newAllergenName"/>

						<div class="add-allergen-alert alert alert-danger" v-if="newAllergenErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="add-allergen-error-items" v-for="(error, index) in newAllergenErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="add-allergen-button" type="button" @click="addAllergen">Add</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-allergen-modal" ref="edit-allergen-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-allergen-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-allergen">
					<label class="edit-allergen-label" for="edit-allergen">Allergen name:</label>
					<div class="edit-allergen-form">
						<input class="edit-allergen-input" name="edit-allergen" v-model="newAllergenName"/>

						<div class="edit-allergen-alert alert alert-danger" v-if="newAllergenErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-allergen-error-items" v-for="(error, index) in newAllergenErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-allergen-button" type="button" @click="editAllergen">Rename allergen</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-allergen-modal" ref="delete-allergen-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-allergen-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-allergen">
					<span>Are you sure you want to delete this allergen?</span><br>
					<button class="delete-btn" @click="deleteAllergen">Delete</button>
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
	name: "AllergensAdmin",
	beforeRouteEnter,

	components: {
		SelectablesRow,
		AdminNavbar,
	},

	data(){
		return {
			searchTerm: "",
			allergens: [],

			newAllergenName: "",
			newAllergenErrors: [],

			currentAllergenId: null,
		}
	},

	methods: {
		async initAllergens(){
			try {
				let response = await this.axios.get(`/recipe/allergens`);

				response.data.sort((a, b) => {
					let textA = a.name.toUpperCase();
					let textB = b.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				this.allergens = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async addAllergen(){
			this.newAllergenErrors = this.allergenInputsAreValid;

			if(this.newAllergenErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/allergens/add`, {
						name: this.newAllergenName.trim(),
					});

					document.getElementById("add-allergen-close-button").click();
					await this.initAllergens();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newAllergenErrors.push(...error.response.data.errorMessage);
					} else {
						this.newAllergenErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async editAllergen(){
			this.newAllergenErrors = this.allergenInputsAreValid;

			if(this.newAllergenErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/allergens/edit/${this.currentAllergenId}`, {
						name: this.newAllergenName.trim(),
					});

					document.getElementById("edit-allergen-close-button").click();
					await this.initAllergens();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newAllergenErrors.push(...error.response.data.errorMessage);
					} else {
						this.newAllergenErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async deleteAllergen(){
			try {
				await this.axios.get(`/recipe/admin/allergens/delete/${this.currentAllergenId}`);

				document.getElementById("delete-allergen-close-button").click();
				await this.initAllergens();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openAddAllergenModal(){
			let addAllergenModal = new Modal(document.getElementById("add-allergen-modal"), {});
			addAllergenModal.show();
		},

		openEditAllergenModal(allergenId, allergenName){
			let editAllergenModal = new Modal(document.getElementById("edit-allergen-modal"), {});
			editAllergenModal.show();

			this.newAllergenName = allergenName;
			this.currentAllergenId = allergenId;
		},

		openDeleteAllergenModal(allergenId){
			let deleteAllergenModal = new Modal(document.getElementById("delete-allergen-modal"), {});
			deleteAllergenModal.show();

			this.currentAllergenId = allergenId;
		},

		clearAddAllergenModal(){
			this.newAllergenName = "";
			this.newAllergenErrors = [];
		},

		clearEditAllergenModal(){
			this.newAllergenName = "";
			this.newAllergenErrors = [];
			this.currentAllergenId = null;
		},

		clearDeleteAllergenModal(){
			this.currentAllergenId = null;
		},

		setModalHandlers(){
			const addAllergenModal = document.getElementById('add-allergen-modal');
			addAllergenModal.addEventListener("hidden.bs.modal", () => this.clearAddAllergenModal());

			const editAllergenModal = document.getElementById('edit-allergen-modal');
			editAllergenModal.addEventListener("hidden.bs.modal", () => this.clearEditAllergenModal());

			const deleteAllergenModal = document.getElementById('delete-allergen-modal');
			deleteAllergenModal.addEventListener("hidden.bs.modal", () => this.clearDeleteAllergenModal());
		},
	},

	computed: {
		allergenInputsAreValid(){
			let errors = [];

			if(this.newAllergenName.trim() === ""){
				errors.push("Please provide a name for the allergen.");

			}

			if(this.newAllergenName.trim().length > 50){
				errors.push("Allergen name can't be longer than 50 characters.");
			}

			return errors;
		}
	},

	mounted() {
		this.initAllergens();
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

			.allergens-container {
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

.add-allergen, .edit-allergen {
	text-align: left;
	display: flex;
	flex-direction: column;
	margin: 0 10% 10px 10%;
	font-family: Gotu, serif;

	.add-allergen-form, .edit-allergen-form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.add-allergen-input, .edit-allergen-input {
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

	.add-allergen-button, .edit-allergen-button {
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

.delete-allergen {
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

	.add-allergen-error-items, .edit-allergen-error-items {
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