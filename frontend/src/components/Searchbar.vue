<!-- Searchbar component for home and search pages -->

<template>
	<div class="searchbar-header">
		<div class="search-container col-xxl-4 col-xl-5 col-lg-6 col-md-7 col-sm-9 col-9">
			<input type="text" class="searchbar" placeholder="Search for a recipe..." v-model="searchTerm"
				   @keydown.enter="emitSearch"/>
			<button type="button" class="search-button" @click="emitSearch">
				<img class="search-icon" src="@/assets/icons/magnifying-glass_white.png" alt="Search">
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "Searchbar",

	props: {
		searchTermProp: String,
	},

	data(){
		return {
			searchTerm: "",
		}
	},

	methods: {
		emitSearch(){
			if(this.searchTerm) {
				this.$emit('search', this.searchTerm);
			}
		},
	},

	watch: {
		'searchTermProp'(value){
			this.searchTerm = value;
		},
	},

	mounted() {
		this.searchTerm = this.searchTermProp;
	}
}
</script>

<style scoped lang="scss">
	.searchbar-header {
		width: 100%;
		height: 15vh;

		background-image: url("@/assets/search_header.jpg");
		background-color: #e2c69e;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;

		display: flex;
		align-items: center;

		.search-container {
			margin-top: auto;
			margin-bottom: auto;
			margin-left: 20%;
			display: flex;
			align-items: center;

			.searchbar {
				font-family: Gotu,serif;
				font-size: 1rem;
				width: 90%;
				padding: 10px 15px;
				border-radius: 20px 0 0 20px;
				height: 3rem;
				border-right: none;
				border-color: transparent;

				&:focus {
					outline: none;
				}
			}

			.search-button {
				width: 60px;
				height: 3rem;
				border-left: none;
				border-radius: 0 20px 20px 0;
				border-color: transparent;
				background-color: var(--yellow);

				display: flex;
				align-items: center;
				justify-content: center;

				&:hover {
					box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
				}

				.search-icon{
					width: 20px;
				}
			}
		}
	}

	@media screen and (max-width: 767px){
		.search-container {
			margin-left: 0 !important;
		}

		.searchbar-header {
			justify-content: center;
		}
	}
</style>