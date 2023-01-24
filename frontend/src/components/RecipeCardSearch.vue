<template>
	<div class="recipe-card-search" @click="navigateToRecipePage">
		<div class="image-container">
			<img class="recipe-image" :src="'data:image/' + imageExt + ';base64,'+ image" alt="recipe-image" v-if="image" />
			<img class="recipe-image" src='/src/assets/default_recipe_photo.png' alt="recipe-image" v-else>
		</div>
		<div class="type-container" v-if="type">
			<p class="type-name">{{ type }}</p>
		</div>
		<div class="recipe-title-container">
			<p class="recipe-title">{{title.length <= 30 ? title : title.substring(0,30) + '...'}}</p>
		</div>
		<div class="recipe-info-container">
			<div class="difficulty-info-container">
				<img class="difficulty-icon" src="@/assets/icons/difficulty_icon.png" alt="dif-icon">
				<p class="difficulty-name">{{ difficulty ? difficulty : "-" }}</p>
			</div>
			<div class="time-info-container">
				<img class="time-icon" src="@/assets/icons/time_icon.png" alt="time-icon">
				<p class="time-name" v-if="hour || minute">
					<span>{{hour ? hour + "h" : ""}}</span>
					<span v-show="hour && minute">{{" "}}</span>
					<span>{{minute ? minute + "m" : ""}}</span>
				</p>
				<p class="time-name" v-else>-</p>
			</div>
		</div>

	</div>
</template>

<script>
export default {
	name: "RecipeCardSearch",
	props: {
		id: null,
		index: null,
		title: "",
		difficulty: "",
		hour: "",
		minute: "",
		type: "",
		imageUrl: "",
		image: "",
		imageExt: "",
	},
	methods: {
		navigateToRecipePage() {
			window.scrollTo(0, 0);
			this.$router.push({path: `/recipe/${this.id}`});
		},
	},

	watch: {
		'id'(){
			if(!this.type){
				document.getElementsByClassName("recipe-title-container").item(this.index).style.marginTop = "15px";
			} else {
				document.getElementsByClassName("recipe-title-container").item(this.index).style.marginTop = "0";

			}
		},
	},

	mounted() {
		if(!this.type){
			document.getElementsByClassName("recipe-title-container").item(this.index).style.marginTop = "15px";
		}
	}
}
</script>

<style scoped lang="scss">
	.recipe-card-search {
		background-color: var(--darkgreen);
		width: 400px;
		height: 400px;
		border-bottom-left-radius: 40px;
		border-bottom-right-radius: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;

		&:hover {
			cursor: pointer;
			opacity: 0.85;
		}

		.image-container {
			background-color: var(--lightgreen);
			width: 400px;
			height: 250px;

			.recipe-image {
				width: 400px;
				height: 250px;
				object-fit: cover;
			}
		}

		.recipe-title {
			font-size: 20px;
			font-family: Gotu,serif;
			margin-top: 25px;
		}

		.type-container {
			background-color: var(--yellow);
			width: 130px;
			height: 35px;
			border-radius: 40px;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10;
			margin-top: -18px;
			margin-right: 15px;
			align-self: flex-end;

			.type-name {
				display: block;
				margin-top: 10px;
				margin-bottom: 10px;
				font-size: 14px;
				font-family: Gotu,serif;
			}
		}

		.recipe-info-container {
			width: 400px;
			display: flex;
			justify-content: space-evenly;


			.difficulty-info-container, .time-info-container {
				background-color: var(--yellow);
				width: 130px;
				height: 35px;
				border-radius: 40px;
				display: flex;
				align-items: center;



				.difficulty-icon {
					width: 25px;
					margin-left: 10px;
				}

				.time-icon {
					width: 20px;
					margin-left: 15px;
				}

				.difficulty-name, .time-name {
					font-family: Gotu,serif;
					font-size: 14px;
					display: block;
					width: 90px;
					text-align: center;
					margin-bottom: 0;
					margin-right: 10px;
					justify-self: flex-end;
				}
			}

		}
	}
</style>