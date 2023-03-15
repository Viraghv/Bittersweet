<!-- Page for uploading new recipe or editing an existing one -->

<template>
	<h1 class="title" v-if="!recipeID">Upload recipe</h1>
	<h1 class="title" v-else>Edit recipe</h1>
	<form class="content col-xxl-8 col-xl-9 col-lg-8 col-md-10 col-sm-11">
		<div class="column-container">
			<div class="column-left">
				<input type="text" class="name-input" placeholder="Name" v-model="recipe.name">
				<div>
					<div
						class="imagePreviewWrapper"
						:style="{ 'background-image': `url(${previewImage})` }"
						@click="selectImage">

						<img class="edit-preview-image" :src="'data:image/' + editPreviewImage.imageExt + ';base64,'+ editPreviewImage.image" alt="recipe-image" v-show="recipeID && editPreviewImage.image && !previewImage" />

						<div class="upload-image-noimage" v-show='!editPreviewImage.image && previewImage === ""'>
							<img src="@/assets/icons/add_icon_black.png" alt="">
							<span>Upload image</span>
						</div>

					</div>

					<input
						class="select-file-input"
						ref="fileInput"
						type="file"
						accept="image/png, image/jpeg"
						@input="pickFile"
						@change="setRecipeImage($event)"
					>
				</div>
				<div class="image-alert-container">
					<div class="image-alert alert alert-danger" v-if="imageErrors.length !== 0">
						<strong>Error!</strong><br>
						<ul>
							<li class="image-error-items" v-for="(error, index) in imageErrors" :key="index">{{error}}</li>
						</ul>
					</div>
				</div>
				<textarea class="description-input" placeholder="Description (max. 1000 characters)" maxlength="1000" v-model="recipe.description"/>
				<span class="description-character-counter">{{recipe.description.length}}/1000</span>

				<h3 class="ingredients-header">Ingredients</h3>
				<ul class="ingredient-list">
					<li class="ingredient-list-li" v-for="(ingredient, index) in recipe.ingredients" :key="index">
						<div class="ingredient-list-item">
							<div class="ingredient-inputs-container">
								<input class="ingredient-amount-input" type="number" placeholder="Amount" v-model="ingredient.amount" >
								<Multiselect class="ingredient-unit-input" v-model="ingredient.unit" :options="units" :searchable="true" :can-clear="false" placeholder="Unit"/>
								<input class="ingredient-name-input" type="text" placeholder="Ingredient" v-model="ingredient.name">
							</div>

							<img class="delete-ingredient-button" src="@/assets/icons/close_grey.png" alt="" @click="deleteIngredient(index)">
						</div>
					</li>
				</ul>
				<div class="add-ingredient-container" @click="addIngredient">
					<img class="add-ingredient-button" src="@/assets/icons/add_icon_black.png" alt="">
					<span class="add-ingredient-text">Add ingredient</span>
				</div>

				<h3 class="steps-header">Steps</h3>
				<ol class="steps-list">
					<li v-for="(step, index) in recipe.steps" :key="index">
						<div class="step-list-item">
							<textarea class="step-description-input" type="text" placeholder="Step description" v-model="step.content"></textarea>
							<img class="delete-step-button" src="@/assets/icons/close_grey.png" alt="" @click="deleteStep(index)">
						</div>
					</li>
				</ol>
				<div class="add-step-container" @click="addStep">
					<img class="add-step-button" src="@/assets/icons/add_icon_black.png" alt="">
					<span class="add-step-text">Add step</span>
				</div>
			</div>
			<div class="column-right">
				<div class="additional-info-container">
					<div class="additional-info-header-container">
						<h3>Additional information</h3>
					</div>
					<div class="additional-info-content">
						<div class="time-required">
							<label>Time required:</label>
							<div class="time-inputs">
								<input class="time-required-hour-input" type="number" placeholder="HH" v-model="recipe.timeHour" @input="restrictHours">
								<span>:</span>
								<input class="time-required-min-input" type="number" placeholder="MM" v-model="recipe.timeMinute" @input="restrictMins">
							</div>
						</div>
						<div class="difficulty">
							<label for="difficulty">Difficulty:</label>
							<Multiselect name="difficulty" class="difficulty-input" v-model="recipe.difficulty" :options="difficultyOptions" :searchable="true" :can-clear="false"/>
						</div>
						<div class="cost">
							<label for="cost">Cost:</label>
							<Multiselect name="cost" class="cost-input" v-model="recipe.cost" :options="costOptions" :searchable="true" :can-clear="false"/>
						</div>
						<div class="portions">
							<label for="portions">Portions:</label>
							<input class="portions-input" type="number" name="portions" v-model="recipe.portions">
							<span>portion(s)</span>
						</div>
						<div class="calories">
							<label for="calories">Calories:</label>
							<input class="calories-input" type="number" name="calories" v-model="recipe.calories">
							<span>kcal/portion</span>
						</div>
						<div class="primary-category">
							<label for="primary-category">Primary category:</label>
							<Multiselect class="primary-category-input" v-model="recipe.primaryCategory" :options="categoriesWithoutOther" :searchable="true" :can-clear="false"/>
						</div>
						<div class="categories">
							<label for="categories">Other categories:</label>
							<Multiselect
								class="categories-input"
								name="categories"
								v-model="recipe.categories"
								:options="categoriesWithoutPrimary"
								mode="tags"
								:close-on-select="false"
								:searchable="true"
							/>
						</div>
						<div class="diets">
							<label for="diets">Diets:</label>
							<Multiselect
								class="diets-input"
								name="diets"
								v-model="recipe.diets"
								:options="dietOptions"
								mode="tags"
								:close-on-select="false"
								:searchable="true"
							/>
						</div>
						<div class="allergens">
							<label for="allergens">Allergens:</label>
							<Multiselect
								class="allergens-input"
								name="allergens"
								v-model="recipe.allergens"
								:options="allergenOptions"
								mode="tags"
								:close-on-select="false"
								:searchable="true"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="submit-alert-container">
			<div class="submit-alert alert alert-danger" v-if="errors.length !== 0">
				<strong>Submit failed!</strong><br>
				<ul>
					<li class="submit-error-items" v-for="(error, index) in errors" :key="index">{{error}}</li>
				</ul>
			</div>
		</div>
		<div class="submit-button-container">
			<button type="button" class="submit-button" @click="submitRecipe" v-if="!recipeID">
				Submit recipe
			</button>
			<button type="button" class="edit-button" @click="editRecipe" v-else>
				Edit recipe
			</button>
			<Loader class="loader" v-if="showLoader"/>
		</div>
	</form>
</template>

<script>
import Multiselect from '@vueform/multiselect';
import Loader from "@/components/Loader.vue";
import {beforeRouteEnter} from "@/handlers/editRecipeNavGuard.js";

export default {
	name: "UploadRecipe",
	beforeRouteEnter,
	components: {
		Loader,
		Multiselect,
	},

	props: {
		recipeID: Number | String,
	},

	data() {
		return {
			previewImage: "",

			recipe: {
				name: "",
				image: null,
				description: "",
				ingredients: [{
					name: "",
					amount: null,
					unit: null,
				}],
				steps: [{
					number: 1,
					content: "",
				}],
				timeHour: null,
				timeMinute: null,
				difficulty: null,
				cost: null,
				portions: null,
				calories: null,
				primaryCategory: null,
				categories: [],
				diets: [],
				allergens: [],
			},

			editPreviewImage: {
				image: "",
				imageExt: "",
			},

			units: {},
			difficultyOptions: {},
			costOptions: {},
			categoryOptions: {},
			dietOptions: {},
			allergenOptions: {},

			errors: [],
			imageErrors: [],

			showLoader: false,
		};
	},
	methods: {
		/**
		 * Opens the file select for uploading the recipe image.
		 */
		selectImage() {
			this.$refs.fileInput.click()
		},

		/**
		 * Sets the preview image for the uploaded recipe image.
		 */
		pickFile() {
			let input = this.$refs.fileInput;
			let file = input.files;
			if((file[0].type === "image/jpeg" || file[0].type === "image/png") && file[0].size <= 1024000){
				if (file && file[0]) {
					let reader = new FileReader;
					reader.onload = e => {
						this.previewImage = e.target.result;
					}
					reader.readAsDataURL(file[0]);
					this.$emit('input', file[0]);
				}
			}
		},

		/**
		 * Validates uploaded recipe image and puts it in the recipe object.
		 * @param event file upload event
		 */
		setRecipeImage(event){
			this.imageErrors = [];

			if(event.target.files.length === 0){
				return;
			}

			// is file either in jpg or png format
			if(event.target.files[0].type !== "image/jpeg" && event.target.files[0].type !== "image/png"){
				this.imageErrors.push("Incorrect file type.")
			}

			// is file bigger than 1MB
			if(event.target.files[0].size > 1024000){
				this.imageErrors.push("File can't be bigger than 1MB.")
			}

			if(this.imageErrors.length > 0){
				this.previewImage = "";
				this.recipe.image = null;
				return;
			}

			this.recipe.image = event.target.files[0];
		},

		addIngredient(){
			this.recipe.ingredients.push({name: "", amount: null, unit: ""});
		},

		deleteIngredient(index){
			this.recipe.ingredients.splice(index, 1);
		},

		addStep(){
			this.recipe.steps.push({number: this.recipe.steps.length + 1, content: ""});
		},

		deleteStep(index){
			this.recipe.steps.splice(index, 1);
		},


		/**
		 * Restricts hour input field so a number higher than 99 cannot be set.
		 */
		restrictHours(){
			if(this.recipe.timeHour > 99){
				this.recipe.timeHour = Math.floor(this.recipe.timeHour / 10) ;
			}
		},

		/**
		 * Restricts minute input field so a number higher than 59 cannot be set.
		 */
		restrictMins(){
			if(this.recipe.timeMinute > 59){
				this.recipe.timeMinute = Math.floor(this.recipe.timeMinute / 10) ;
			}
		},

		/**
		 * Initializes unit options.
		 */
		async initUnits(){
			try {
				const response = await this.axios.get('/recipe/units');
				for(const unit of response.data){
					this.units[unit.id] = unit.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes difficulty options.
		 */
		async initDifficulties(){
			try {
				const response = await this.axios.get('/recipe/difficulties');
				for(const difficulty of response.data){
					this.difficultyOptions[difficulty.id] = difficulty.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes cost options.
		 */
		async initCosts(){
			try {
				const response = await this.axios.get('/recipe/costs');
				for(const cost of response.data){
					this.costOptions[cost.id] = cost.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes recipe category options.
		 */
		async initCategories(){
			try {
				const response = await this.axios.get('/recipe/categories');
				for(const category of response.data){
					this.categoryOptions[category.id] = category.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes diet options.
		 */
		async initDiets(){
			try {
				const response = await this.axios.get('/recipe/diets');
				for(const diet of response.data){
					this.dietOptions[diet.id] = diet.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes allergen options.
		 */
		async initAllergens(){
			try {
				const response = await this.axios.get('/recipe/allergens');
				for(const allergen of response.data){
					this.allergenOptions[allergen.id] = allergen.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes recipe data in input fields (when page is accessed for recipe editing).
		 */
		async initRecipe(){
			// if page is in editing mode
			if(this.recipeID){
				try {
					// get recipe data
					const response = await this.axios.get(`/recipe/recipeById/${this.recipeID}`);
					// put data in input fields
					this.recipe.name = response.data.name;
					this.recipe.description = response.data.description;

					this.recipe.ingredients = [];
					for (let i = 0; i < response.data.ingredients.length; i++) {
						this.recipe.ingredients.push({
							name: response.data.ingredients[i].name,
							amount: response.data.ingredients[i].amount,
							unit: response.data.ingredients[i].unitId,
						});
					}

					this.recipe.steps = [];
					for (let i = 0; i < response.data.steps.length; i++) {
						this.recipe.steps.push({
							number: response.data.steps[i].number,
							content: response.data.steps[i].content,
						});
					}
					this.sortSteps();

					this.recipe.timeHour = response.data.hour;
					this.recipe.timeMinute = response.data.minute;

					if(response.data.difficulty){
						for (let difficultyId in this.difficultyOptions) {
							if(this.difficultyOptions[difficultyId] === response.data.difficulty){
								this.recipe.difficulty = difficultyId;
							}
						}
					}

					if(response.data.cost){
						for (let costId in this.costOptions) {
							if(this.costOptions[costId] === response.data.cost){
								this.recipe.cost = costId;
							}
						}
					}

					this.recipe.portions = response.data.portions;
					this.recipe.calories = response.data.calories;

					for (let i = 0; i < response.data.categories.length; i++) {
						if(response.data.categories[i].primary === true){
							for (let categoryId in this.categoryOptions) {
								if(this.categoryOptions[categoryId] === response.data.categories[i].name){
									this.recipe.primaryCategory = categoryId;
								}
							}
						} else {
							for (let categoryId in this.categoryOptions) {
								if(this.categoryOptions[categoryId] === response.data.categories[i].name){
									this.recipe.categories.push(categoryId);
								}
							}
						}
					}

					for (let i = 0; i < response.data.diets.length; i++) {
						for (let dietId in this.dietOptions) {
							if(this.dietOptions[dietId] === response.data.diets[i]){
								this.recipe.diets.push(dietId);
							}
						}
					}

					for (let i = 0; i < response.data.allergens.length; i++) {
						for (let allergenId in this.allergenOptions) {
							if(this.allergenOptions[allergenId] === response.data.allergens[i]){
								this.recipe.allergens.push(allergenId);
							}
						}
					}

					// get recipe image
					if(response.data.photo && response.data.photo !== "default") {
						const imageResponse = await this.axios.get(`/recipe/recipeImage/${response.data.photo}`);
						this.editPreviewImage.image = imageResponse.data;
						this.editPreviewImage.imageExt = response.data.photo.split(".")[1];
					}
				} catch (error) {
					console.log(error.response.data);
				}
			}
		},

		/**
		 * Uploads new recipe.
		 */
		async submitRecipe(){
			// validate recipe inputs
			this.errors = this.inputsValid;

			if(this.errors.length === 0 && this.imageErrors.length === 0){
				// convert recipe object to fit backend
				let categories = [];
				if(this.recipe.primaryCategory){
					categories.push({
						primary: true,
						category: Number(this.recipe.primaryCategory),
					})
				}

				for(const category of this.recipe.categories){
					categories.push({
						primary: false,
						category: Number(category),
					})
				}

				for (let i = 0; i < this.recipe.diets.length; i++) {
					this.recipe.diets[i] = Number(this.recipe.diets[i]);
				}

				for (let i = 0; i < this.recipe.allergens.length; i++) {
					this.recipe.allergens[i] = Number(this.recipe.allergens[i]);
				}

				for (let i = 0; i < this.recipe.ingredients.length; i++) {
					this.recipe.ingredients[i].name = this.recipe.ingredients[i].name.trim();
				}

				for (let i = 0; i < this.recipe.steps.length; i++) {
					this.recipe.steps[i].content = this.recipe.steps[i].content.trim();
				}

				this.showLoader = true;
				const formData = new FormData();
				formData.append('image', this.recipe.image);

				try {
					// upload new recipe
					const response = await this.axios.post("/recipe/create", {
						name: this.recipe.name.trim(),
						description: this.recipe.description.trim(),
						ingredients: this.recipe.ingredients,
						steps: this.recipe.steps,
						timeHour: this.recipe.timeHour,
						timeMinute: this.recipe.timeMinute,
						difficulty: this.recipe.difficulty,
						cost: this.recipe.cost,
						portions: this.recipe.portions,
						calories: this.recipe.calories,
						categories: categories,
						diets: this.recipe.diets,
						allergens: this.recipe.allergens,
					})

					const recipeId = response.data

					// upload recipe image
					await this.axios.post(
						`/recipe/uploadImage/${recipeId}`,
						formData,
						{
							headers: {
								'Content-Type': 'multipart/form-data'
							}
						}
					)

					this.showLoader = false;
					window.scrollTo(0,0);
					// go to recipe page of new recipe
					await this.$router.push({path: `/recipe/${recipeId}`});
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.errors.push(...error.response.data.errorMessage);
					} else {
						this.errors.push(error.response.data.errorMessage);
					}
					this.showLoader = false;
				}
			}
		},

		/**
		 * Edits existing recipe.
		 */
		async editRecipe(){
			// validate recipe inputs
			this.errors = this.inputsValid;

			if(this.errors.length === 0 && this.imageErrors.length === 0){
				// convert recipe object to fit backend
				let categories = [];
				if(this.recipe.primaryCategory){
					categories.push({
						primary: true,
						category: Number(this.recipe.primaryCategory),
					})
				}

				for(const category of this.recipe.categories){
					categories.push({
						primary: false,
						category: Number(category),
					})
				}

				for (let i = 0; i < this.recipe.diets.length; i++) {
					this.recipe.diets[i] = Number(this.recipe.diets[i]);
				}

				for (let i = 0; i < this.recipe.allergens.length; i++) {
					this.recipe.allergens[i] = Number(this.recipe.allergens[i]);
				}

				for (let i = 0; i < this.recipe.ingredients.length; i++) {
					this.recipe.ingredients[i].name = this.recipe.ingredients[i].name.trim();
					this.recipe.ingredients[i].unit = Number(this.recipe.ingredients[i].unit);
				}

				for (let i = 0; i < this.recipe.steps.length; i++) {
					this.recipe.steps[i].content = this.recipe.steps[i].content.trim();
					this.recipe.steps[i].number = Number(this.recipe.steps[i].number);
				}

				this.showLoader = true;
				const formData = new FormData();
				formData.append('image', this.recipe.image);

				try {
					// upload edited recipe
					await this.axios.post(`/recipe/edit/${this.recipeID}`, {
						name: this.recipe.name.trim(),
						description: this.recipe.description.trim(),
						ingredients: this.recipe.ingredients,
						steps: this.recipe.steps,
						timeHour: Number(this.recipe.timeHour),
						timeMinute: Number(this.recipe.timeMinute),
						difficulty: Number(this.recipe.difficulty),
						cost: Number(this.recipe.cost),
						portions: Number(this.recipe.portions),
						calories: Number(this.recipe.calories),
						categories: categories,
						diets: this.recipe.diets,
						allergens: this.recipe.allergens,
					})

					// upload recipe image, if new image was set
					if(this.recipe.image){
						await this.axios.post(
							`/recipe/uploadImage/${this.recipeID}`,
							formData,
							{
								headers: {
									'Content-Type': 'multipart/form-data'
								}
							}
						)
					}

					this.showLoader = false;
					window.scrollTo(0,0);
					// go to recipe page of edited recipe
					await this.$router.push({path: `/recipe/${this.recipeID}`});
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.errors.push(...error.response.data.errorMessage);
					} else {
						this.errors.push(error.response.data.errorMessage);
					}
					this.showLoader = false;
				}
			}
		},

		/**
		 * Sorts steps by their step number.
		 */
		sortSteps(){
			this.recipe.steps.sort((a, b) => a.number - b.number);
		},

		clearPage(){
			this.recipe = {
				name: "",
				image: null,
				description: "",
				ingredients: [{
					name: "",
					amount: null,
					unit: null,
				}],
				steps: [{
					number: 1,
					content: "",
				}],
				timeHour: null,
				timeMinute: null,
				difficulty: null,
				cost: null,
				portions: null,
				calories: null,
				primaryCategory: null,
				categories: [],
				diets: [],
				allergens: [],
			}

			this.previewImage = "";
			this.editPreviewImage = {
				image: "",
				imageExt: "",
			};
			this.units = {};
			this.difficultyOptions = {};
			this.costOptions = {};
			this.categoryOptions = {};
			this.dietOptions = {};
			this.allergenOptions = {};


			this.errors = [];
			this.imageErrors = [];

			this.showLoader = false;
		},

		initPage(){
			this.clearPage();

			this.initUnits();
			this.initDifficulties();
			this.initCosts();
			this.initCategories();
			this.initDiets();
			this.initAllergens();

			this.initRecipe();
		},
	},

	computed: {
		/**
		 * @returns array of categories without he primary category
		 */
		categoriesWithoutPrimary(){
			let result = {...this.categoryOptions};

			delete result[this.recipe.primaryCategory];

			return result;
		},

		/**
		 * @returns array of categories that have not been selected in the 'Other categories' field
		 */
		categoriesWithoutOther(){
			let result = {...this.categoryOptions};

			for(const value of this.recipe.categories.values()){
				delete result[value];
			}

			return result;
		},

		/**
		 * Validates recipe inputs.
		 * @returns array of validation error messages
		 */
		inputsValid(){
			let errors = [];

			// is recipe name and description fields filled
			if(this.recipe.name.trim() === "" || this.recipe.description.trim() === ""){
				errors.push("Please provide a recipe name and description.");
			}

			// is a valid recipe image uploaded
			if(!this.recipe.image && !this.editPreviewImage.image){
				errors.push("Please upload a valid image (jpg, png).");
			}

			// is there at least one ingredient given
			if(this.recipe.ingredients.length === 0){
				errors.push("Please list the necessary ingredients.");
			} else {
				// does every ingredient have a name
				for(const ingredient of this.recipe.ingredients){
					if(ingredient.name.trim() === ""){
						errors.push("Please give the name of every ingredient.");
						break;
					}
				}
			}

			// is there at least one step given
			if(this.recipe.steps.length === 0){
				errors.push("Please list the necessary steps.");
			} else {
				// is there a description given for every step
				for(const step of this.recipe.steps){
					if(step.content.trim() === ""){
						errors.push("Please give the description of every step.");
						break;
					}
				}
			}

			// is recipe name longer than 100 characters
			if(this.recipe.name.trim().length > 100){
				errors.push("Recipe name can't be longer than 100 characters.");
			}

			// is recipe description longer than 1000 characters
			if(this.recipe.description.trim().length > 1000){
				errors.push("Recipe description can't be longer than 1000 characters.");
			}

			// is the name of an ingredient longer than 100 characters
			for(const ingredient of this.recipe.ingredients){
				if(ingredient.name.trim().length > 100){
					errors.push("Ingredient name can't be longer than 100 characters.");
					break;
				}
			}

			// is the description of a step longer than 1000 characters
			for(const step of this.recipe.steps){
				if(step.content.trim().length > 1000){
					errors.push("Step description can't be longer than 1000 characters.");
					break;
				}
			}

			// are there only whole numbers in the Additional information section
			if((this.recipe.timeHour && this.recipe.timeHour !== Math.floor(this.recipe.timeHour)) ||
			   (this.recipe.timeMinute && this.recipe.timeMinute !== Math.floor(this.recipe.timeMinute)) ||
			   (this.recipe.portions && this.recipe.portions !== Math.floor(this.recipe.portions)) ||
			   (this.recipe.calories && this.recipe.calories !== Math.floor(this.recipe.calories))){

				errors.push("Please only enter whole numbers in the 'Additional information' section.");
			}

			return errors;
		}
	},

	watch: {
		"recipeID"(){
			this.initPage();
		},
	},

	mounted() {
		this.initPage();
	}

}
</script>

<style scoped lang="scss">
	.title{
		font-family: Gotu,serif;
		font-size: 2rem;
		text-align: center;
		margin-top: 50px;
		margin-bottom: 40px;
	}

	.content {
		background-color: var(--lightgreen);
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 140px;
		border-radius: 20px;

		display: flex;
		flex-direction: column;

		.submit-button-container {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0 5% 3% 5%;

			.submit-button, .edit-button {
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				background-color: var(--yellow);
				font-family: Gotu,serif;
				font-size: 1.4rem;
				padding: 10px 30px;

				&:hover {
					opacity: 0.8;
				}
			}
			.loader {
				height: 36px;
				width: 36px;
				margin-left: 10px;
			}
		}

		.submit-alert-container{
			padding: 0 5% 3% 5%;
		}

	}

	.column-container {
		display: flex;
		flex-direction: row;

		.column-left {
			padding: 3% 5% 3% 5%;
			width: 60%;
			display: flex;
			flex-direction: column;

			.name-input {
				width: 100%;
				border-radius: 10px;
				border-color: transparent;
				padding: 7px 15px;
				font-size: 1rem;
				font-family: Gotu,serif;
				margin-bottom: 15px;


				&:focus {
					outline: var(--darkgreen) solid 3px;
				}

			}

			.imagePreviewWrapper {
				max-width: 600px;
				height: 400px;
				cursor: pointer;
				background-size: cover;
				background-repeat: no-repeat;
				background-position: center center;
				background-color: var(--yellow);
				border-radius: 20px;
				opacity: 1;
				transition: 0.3s ease;
				display: flex;
				margin: 10px auto 15px;

				&:hover {
					opacity: 0.8;
					transition: 0.3s ease;
				}

				.edit-preview-image {
					width: 100%;
					max-width: 600px;
					height: 400px;
					border-radius: 20px;
					object-fit: cover
				}

				.upload-image-noimage{
					display: flex;
					flex-direction: column;
					justify-content: center;
					width: fit-content;
					margin: auto;

					img {
						width: 70%;
						margin: auto;
					}

					span {
						text-align: center;
						font-family: Gotu,serif;
						font-size: 1.2rem;
						margin-top: 5px;
					}
				}
			}
			.select-file-input {
				display: none;
			}

			.description-input {
				width: 100%;
				resize: none;
				border-radius: 10px;
				border-color: transparent;
				padding: 15px;
				font-size: 1rem;
				font-family: Gotu,serif;
				margin-top: 10px;
				margin-bottom: 10px;
				height: 150px;

				&:focus {
					outline: var(--darkgreen) solid 3px;
				}
			}

			.description-character-counter {
				width: 100%;
				text-align: right;
				font-family: Gotu,serif;
				margin-bottom: 25px;
			}
			
			.ingredients-header, .steps-header {
				font-family: Gotu,serif;
				font-size: 1.5rem;
				margin-bottom: 15px;
			}

			.ingredient-list, .steps-list {
				margin-bottom: 5px;
				font-family: Gotu,serif;

				.ingredient-list-item, .step-list-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 5px;
					width: 100%;
					margin-bottom: 5px;

					.ingredient-inputs-container {
						width: 100%;
						display: flex;
						justify-content: space-between;
						align-items: center;
					}

					.ingredient-name-input, .ingredient-amount-input, .ingredient-unit-input, .step-description-input {
						border-radius: 10px;
						border-color: transparent;
						padding: 7px 15px;
						font-size: 1rem;
						font-family: Gotu,serif;
						height: 2.7rem;
						resize: none;

						&:focus {
							outline: var(--darkgreen) solid 3px;
						}

						&.small-screen {
							display: none;
						}
					}

					.step-description-input {
						width: 95%;
						margin-left: 10px;
						height: 4rem;
						min-height: 100px;
					}

					.ingredient-name-input {
						width: 50%;
					}

					.ingredient-amount-input {
						width: 20%;
						margin-left: 10px;

						&::-webkit-outer-spin-button,
						&::-webkit-inner-spin-button {
							-webkit-appearance: none;
							margin: 0;
						}
					}

					input[type=number] {
						-moz-appearance: textfield;
					}

					.ingredient-unit-input {
						width: 25%;

						&:invalid {
							color: grey;
						}


					}

					.delete-ingredient-button, .delete-step-button {
						height: 1.2rem;
						margin-left: 10px;

						&:hover {
							cursor: pointer;
						}
					}
				}
			}

			.steps-list {
				font-size: 1.25rem;
			}

			.add-ingredient-container, .add-step-container {
				display: flex;
				align-items: center;
				border-radius: 10px;
				height: 2.7rem;
				margin-bottom: 25px;

				&:hover {
					cursor: pointer;
					background-color: var(--darkgreen);
				}

				.add-ingredient-button, .add-step-button {
					height: 2rem;
					margin-right: 20px;
					margin-left: 5%;
				}
				
				.add-ingredient-text, .add-step-text {
					font-family: Gotu,serif;
					margin-top: 4px;
				}
			}
		}

		.column-right {
			width: 40%;
			padding: 3% 5% 3% 0;

			.additional-info-container {
				background-color: var(--darkgreen);
				border-radius: 20px;

				.additional-info-header-container {
					background-color: var(--yellow);
					padding: 20px 30px 10px 30px;
					display: flex;
					align-items: center;
					border-top-left-radius: 20px;
					border-top-right-radius: 20px;
					
					h3 {
						font-family: Gotu,serif;
						font-size: 1.3rem;
						margin: 0;
					}
				}

				.additional-info-content{
					font-family: Gotu,serif;
					padding: 30px;

					label {
						margin-right: 25px;
					}

					.time-required-hour-input, .time-required-min-input {
						width: 4rem;
						text-align: center;

						&::-webkit-outer-spin-button,
						&::-webkit-inner-spin-button {
							-webkit-appearance: none;
							margin: 0;
						}
					}

					.time-inputs {
						display: inline-block;
					}

					.time-required-hour-input, .time-required-min-input, .difficulty-input, .cost-input, .portions-input,
					.calories-input, .primary-category-input, .categories-input, .allergens-input, .diets-input {
						border-radius: 10px;
						border-color: transparent;
						margin-bottom: 15px;

						&:focus {
							outline: var(--lightgreen) solid 3px;
						}

						&::-webkit-outer-spin-button,
						&::-webkit-inner-spin-button {
							-webkit-appearance: none;
							margin: 0;
						}
					}

					.time-required-hour-input, .time-required-min-input, .difficulty-input, .cost-input, .portions-input,
					.calories-input, .primary-category-input {
						padding: 3px 5px;
					}

					.time-required-hour-input {
						margin-right: 10px;
					}

					.time-required-min-input{
						margin-left: 10px;
					}

					.portions-input, .calories-input{
						margin-right: 10px;
						text-align: center;
					}

					.difficulty {
						display: flex;
						flex-direction: row;
						align-items: center;
						margin-bottom: 15px;
					}

					.difficulty-input {
						width: 200px;
						margin-bottom: 0;
						margin-left: 0;
					}

					.cost {
						display: flex;
						flex-direction: row;
						align-items: center;
						margin-bottom: 15px;
					}

					.cost-input {
						width: 200px;
						margin-bottom: 0;
						margin-left: 0;
					}

					.portions-input {
						width: 3rem;
					}

					.calories-input {
						width: 4rem;
					}

					.primary-category {
						display: flex;
						flex-direction: row;
						align-items: center;
						margin-bottom: 15px;
					}

					.primary-category-input {
						width: 170px;
						margin-bottom: 0;
						margin-left: 0;
					}

				}
			}
		}
	}

	.alert {
		width: 100%;

		.image-error-items, .submit-error-items {
			font-size: 1rem;
		}

		&.image-alert, &.submit-alert {
			padding-bottom: 5px;
		}
	}

	@media screen and (max-width: 1500px){
		.column-container {
			flex-direction: column;

			.column-left {
				width: 100%;
			}

			.column-right {
				width: 100%;
				padding: 0 5%;
			}
		}
	}

	@media screen and (max-width: 650px){
		.ingredient-list-item {
			margin-bottom: 10px !important;

			.ingredient-amount-input, .ingredient-unit-input, .ingredient-name-input {
				width: 100% !important;
				margin-left: 0 !important;
			}

			.ingredient-inputs-container {
				flex-direction: column;
				gap: 5px;
			}

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