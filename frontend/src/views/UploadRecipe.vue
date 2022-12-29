<template>
	<h1 class="title">Upload recipe</h1>
	<form class="content col-xxl-8 col-xl-9 col-lg-8 col-md-10 col-sm-11">
		<div class="column-container">
			<div class="column-left">
				<input type="text" class="name-input" placeholder="Name" v-model="recipe.name">
				<div>
					<div
						class="imagePreviewWrapper"
						:style="{ 'background-image': `url(${previewImage})` }"
						@click="selectImage">

						<div class="upload-image-noimage" v-show='previewImage === ""'>
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
					<li v-for="(ingredient, index) in recipe.ingredients" :key="index">
						<div class="ingredient-list-item">
							<input class="ingredient-amount-input" type="number" placeholder="Amount" v-model="ingredient.amount" >
							<Multiselect class="ingredient-unit-input" v-model="ingredient.unit" :options="units" :searchable="true" :can-clear="false" placeholder="Unit"/>
							<!--							<select class="ingredient-unit-input" v-model="ingredient.unit">-->
							<!--								<option value="" disabled selected hidden>Unit</option>-->
							<!--								<option v-for="(unit, index) in units" :key="index" :value="unit">{{unit}}</option>-->
							<!--							</select>-->
							<input class="ingredient-name-input" type="text" placeholder="Ingredient name" v-model="ingredient.name">
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
							<input class="step-description-input" type="text" placeholder="Step description" v-model="step.content">
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
<!--							<select class="difficulty-input" name="difficulty" v-model="recipe.difficulty">-->
<!--								<option :value="null" selected></option>-->
<!--								<option v-for="(difficulty, index) in difficultyOptions" :key="index" :value="difficulty">{{difficulty}}</option>-->
<!--							</select>-->
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
							<span>kcal</span>
						</div>
						<div class="primary-category">
							<label for="primary-category">Primary category:</label>
							<Multiselect class="primary-category-input" v-model="recipe.primaryCategory" :options="categoriesWithoutOther" :searchable="true" :can-clear="false"/>
<!--							<select class="primary-category-input" name="primary-category" v-model="recipe.primaryCategory">-->
<!--								<option :value="null" selected></option>-->
<!--								<option v-for="(category, index) in categoriesWithoutOther" :key="index" :value="category">{{category}}</option>-->
<!--							</select>-->
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
			<button type="button" class="submit-button" @click="submitRecipe">
				Submit recipe
			</button>
			<Loader class="loader" v-if="showLoader"/>
		</div>
	</form>
</template>

<script>
import Multiselect from '@vueform/multiselect';
import Loader from "@/components/Loader.vue";
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";

export default {
	name: "UploadRecipe",
	beforeRouteEnter,
	components: {
		Loader,
		Multiselect,
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
				allergens: [],
			},

			units: {},
			difficultyOptions: {},
			costOptions: {},
			categoryOptions: {},
			allergenOptions: {},

			errors: [],
			imageErrors: [],

			showLoader: false,
		};
	},
	methods: {
		selectImage () {
			this.$refs.fileInput.click()
		},

		pickFile () {
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

		setRecipeImage(event){
			this.imageErrors = [];

			if(event.target.files.length === 0){
				return;
			}

			if(event.target.files[0].type !== "image/jpeg" && event.target.files[0].type !== "image/png"){
				this.imageErrors.push("Incorrect file type.")
			}

			if(event.target.files[0].size > 1024000){
				this.imageErrors.push("File can't be bigger than 1MB")
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


		restrictHours(){
			if(this.recipe.timeHour > 99){
				this.recipe.timeHour = Math.floor(this.recipe.timeHour / 10) ;
			}
		},

		restrictMins(){
			if(this.recipe.timeMinute > 59){
				this.recipe.timeMinute = Math.floor(this.recipe.timeMinute / 10) ;
			}
		},

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

		async submitRecipe(){
			this.errors = this.inputsValid;

			if(this.errors.length === 0 && this.imageErrors.length === 0){
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

				for (let i = 0; i < this.recipe.allergens.length; i++) {
					this.recipe.allergens[i] = Number(this.recipe.allergens[i]);
				}

				for (let i = 0; i < this.recipe.ingredients; i++) {
					this.recipe.ingredients[i].name = this.recipe.ingredients[i].name.trim();
				}

				for (let i = 0; i < this.recipe.steps; i++) {
					this.recipe.steps[i].content = this.recipe.steps[i].content.trim();
				}

				this.showLoader = true;
				const formData = new FormData();
				formData.append('image', this.recipe.image);
				// formData.append('name', this.recipe.name);
				// formData.append('description', this.recipe.description);
				// formData.append('ingredients', this.recipe.ingredients);
				// formData.append('steps', this.recipe.steps);
				// formData.append('timeHour', this.recipe.timeHour);
				// formData.append('timeMinute', this.recipe.timeMinute);
				// formData.append('difficulty', this.recipe.difficulty);
				// formData.append('cost', this.recipe.cost);
				// formData.append('portions', this.recipe.portions);
				// formData.append('calories', this.recipe.calories);
				// formData.append('categories', categories);
				// formData.append('allergens', this.recipe.allergens);

				try {
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
						allergens: this.recipe.allergens,
					})

					const recipeId = response.data


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
					await this.$router.replace({name: 'Home'});
				} catch (err) {
					this.errors.push(...err.response.data.errorMessage);
					this.showLoader = false;
				}
			}
		}
	},
	computed: {
		categoriesWithoutPrimary(){
			let result = {...this.categoryOptions};

			delete result[this.recipe.primaryCategory];

			return result;
		},

		categoriesWithoutOther(){
			let result = {...this.categoryOptions};

			for(const value of this.recipe.categories.values()){
				delete result[value];
			}

			return result;
		},

		inputsValid(){
			let errors = [];

			if(this.recipe.name.trim() === "" || this.recipe.description.trim() === ""){
				errors.push("Please provide a recipe name and description.");
			}

			if(!this.recipe.image){
				errors.push("Please upload a valid image (jpg, png, gif).");
			}

			if(this.recipe.ingredients.length === 0){
				errors.push("Please list the necessary ingredients.");
			} else {
				for(const ingredient of this.recipe.ingredients){
					if(ingredient.name.trim() === ""){
						errors.push("Please give the name of every ingredient.");
						break;
					}
				}
			}

			if(this.recipe.steps.length === 0){
				errors.push("Please list the necessary steps.");
			} else {
				for(const step of this.recipe.steps){
					if(step.content.trim() === ""){
						errors.push("Please give the description of every step.");
						break;
					}
				}
			}

			if(this.recipe.name.trim().length > 100){
				errors.push("Recipe name can't be longer than 100 characters.");
			}

			if(this.recipe.description.trim().length > 1000){
				errors.push("Recipe description can't be longer than 1000 characters.");
			}

			for(const ingredient of this.recipe.ingredients){
				if(ingredient.name.trim().length > 100){
					errors.push("Ingredient name can't be longer than 100 characters.");
					break;
				}
			}

			for(const step of this.recipe.steps){
				if(step.content.trim().length > 1000){
					errors.push("Step description can't be longer than 1000 characters.");
					break;
				}
			}

			if((this.recipe.timeHour && this.recipe.timeHour !== Math.floor(this.recipe.timeHour)) ||
			   (this.recipe.timeMinute && this.recipe.timeMinute !== Math.floor(this.recipe.timeMinute)) ||
			   (this.recipe.portions && this.recipe.portions !== Math.floor(this.recipe.portions)) ||
			   (this.recipe.calories && this.recipe.calories !== Math.floor(this.recipe.calories))){

				errors.push("Please only enter whole numbers in the 'Additional information' section.");
			}

			return errors;
		}
	},

	mounted() {
		this.initUnits();
		this.initDifficulties();
		this.initCosts();
		this.initCategories();
		this.initAllergens();
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

			.submit-button {
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
				height: 10vh;

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

					.ingredient-name-input, .ingredient-amount-input, .ingredient-unit-input, .step-description-input {
						border-radius: 10px;
						border-color: transparent;
						padding: 7px 15px;
						font-size: 1rem;
						font-family: Gotu,serif;
						height: 2.7rem;

						&:focus {
							outline: var(--darkgreen) solid 3px;
						}
					}

					.step-description-input {
						width: 95%;
						margin-left: 10px;
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
					.calories-input, .primary-category-input, .categories-input, .allergens-input {
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

</style>