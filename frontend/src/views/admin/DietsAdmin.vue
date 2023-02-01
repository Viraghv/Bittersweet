<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="DietsAdmin"/>
		</div>
		<div class="main-container">
			<div class="all-container">
				<div class="searchbar-container">
					<input class="searchbar-input" type="text" v-model="searchTerm" placeholder="Search...">
				</div>
				<div class="diets-container">
					<SelectablesRow mode="add" type="diet" @add="openAddDietModal"/>
					<SelectablesRow type="diet" v-for="(diet, index) in diets" :key="index"
									:id="diet.id" :name="diet.name"
									v-show="diet.name.includes(searchTerm)"
									@edit="openEditDietModal" @delete="openDeleteDietModal"/>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="add-diet-modal" ref="add-diet-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-diet-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-diet">
					<label class="add-diet-label" for="add-diet">Diet name:</label>
					<div class="add-diet-form">
						<input class="add-diet-input" name="add-diet" v-model="newDietName"/>

						<div class="add-diet-alert alert alert-danger" v-if="newDietErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="add-diet-error-items" v-for="(error, index) in newDietErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="add-diet-button" type="button" @click="addDiet">Add</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-diet-modal" ref="edit-diet-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-diet-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-diet">
					<label class="edit-diet-label" for="edit-diet">Diet name:</label>
					<div class="edit-diet-form">
						<input class="edit-diet-input" name="edit-diet" v-model="newDietName"/>

						<div class="edit-diet-alert alert alert-danger" v-if="newDietErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-diet-error-items" v-for="(error, index) in newDietErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-diet-button" type="button" @click="editDiet">Rename diet</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-diet-modal" ref="delete-diet-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-diet-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-diet">
					<span>Are you sure you want to delete this diet?</span><br>
					<button class="delete-btn" @click="deleteDiet">Delete</button>
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
	name: "DietsAdmin",
	beforeRouteEnter,

	components: {
		SelectablesRow,
		AdminNavbar,
	},

	data(){
		return {
			searchTerm: "",
			diets: [],

			newDietName: "",
			newDietErrors: [],

			currentDietId: null,
		}
	},

	methods: {
		async initDiets(){
			try {
				let response = await this.axios.get(`/recipe/diets`);

				response.data.sort((a, b) => {
					let textA = a.name.toUpperCase();
					let textB = b.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				this.diets = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async addDiet(){
			this.newDietErrors = this.dietInputsAreValid;

			if(this.newDietErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/diets/add`, {
						name: this.newDietName.trim(),
					});

					document.getElementById("add-diet-close-button").click();
					await this.initDiets();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newDietErrors.push(...error.response.data.errorMessage);
					} else {
						this.newDietErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async editDiet(){
			this.newDietErrors = this.dietInputsAreValid;

			if(this.newDietErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/diets/edit/${this.currentDietId}`, {
						name: this.newDietName.trim(),
					});

					document.getElementById("edit-diet-close-button").click();
					await this.initDiets();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newDietErrors.push(...error.response.data.errorMessage);
					} else {
						this.newDietErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async deleteDiet(){
			try {
				await this.axios.get(`/recipe/admin/diets/delete/${this.currentDietId}`);

				document.getElementById("delete-diet-close-button").click();
				await this.initDiets();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openAddDietModal(){
			let addDietModal = new Modal(document.getElementById("add-diet-modal"), {});
			addDietModal.show();
		},

		openEditDietModal(dietId, dietName){
			let editDietModal = new Modal(document.getElementById("edit-diet-modal"), {});
			editDietModal.show();

			this.newDietName = dietName;
			this.currentDietId = dietId;
		},

		openDeleteDietModal(dietId){
			let deleteDietModal = new Modal(document.getElementById("delete-diet-modal"), {});
			deleteDietModal.show();

			this.currentDietId = dietId;
		},

		clearAddDietModal(){
			this.newDietName = "";
			this.newDietErrors = [];
		},

		clearEditDietModal(){
			this.newDietName = "";
			this.newDietErrors = [];
			this.currentDietId = null;
		},

		clearDeleteDietModal(){
			this.currentDietId = null;
		},

		setModalHandlers(){
			const addDietModal = document.getElementById('add-diet-modal');
			addDietModal.addEventListener("hidden.bs.modal", () => this.clearAddDietModal());

			const editDietModal = document.getElementById('edit-diet-modal');
			editDietModal.addEventListener("hidden.bs.modal", () => this.clearEditDietModal());

			const deleteDietModal = document.getElementById('delete-diet-modal');
			deleteDietModal.addEventListener("hidden.bs.modal", () => this.clearDeleteDietModal());
		},
	},

	computed: {
		dietInputsAreValid(){
			let errors = [];

			if(this.newDietName.trim() === ""){
				errors.push("Please provide a name for the diet.");

			}

			if(this.newDietName.trim().length > 50){
				errors.push("Diet name can't be longer than 50 characters.");
			}

			return errors;
		}
	},

	mounted() {
		this.initDiets();
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

			.diets-container {
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

.add-diet, .edit-diet {
	text-align: left;
	display: flex;
	flex-direction: column;
	margin: 0 10% 10px 10%;
	font-family: Gotu, serif;

	.add-diet-form, .edit-diet-form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.add-diet-input, .edit-diet-input {
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

	.add-diet-button, .edit-diet-button {
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

.delete-diet {
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

	.add-diet-error-items, .edit-diet-error-items {
		font-size: 0.8rem;
	}
}
</style>