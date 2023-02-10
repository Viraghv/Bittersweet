<template>
	<div class="footer">
		<div class="attributions-container">
			<div class="flaticon-container">
				<span class="flaticon-text">Icons:</span>
				<a class="flaticon-link" href="https://www.flaticon.com/" target="_blank">
					<img class="flaticon-logo" src="@/assets/flaticon_logo_transparent.png" alt="flaticon-logo">
				</a>
			</div>
			<div class="freepik-container">
				<span class="freepik-text">Banner:</span>
				<a class="freepik-link" href="https://www.freepik.com/" target="_blank">
					<img class="freepik-logo" src="@/assets/freepik_logo_transparent.png" alt="freepik-logo">
				</a>
			</div>
			<div class="allrecipes-container">
				<span class="allrecipes-text">Recipes:</span>
				<a class="allrecipes-link" href="https://www.allrecipes.com/" target="_blank">
					<img class="allrecipes-logo" src="@/assets/allrecipes_logo_transparent.png" alt="allrecipes-logo">
				</a>
			</div>
		</div>
		<router-link :to="{name: 'Home'}">
			<img
				class="logo"
				src="@/assets/logo_yellow.png"
				alt="logo"
			/>
		</router-link>
	</div>
</template>

<script>
export default {
	name: "Footer"
}
</script>

<style scoped lang="scss">
.footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	background-color: var(--darkgrey);
	padding: 2vh 4vh;
	z-index: 200;

	.logo{
		width: 100%;
		height: 40px;
	}

	.attributions-container {
		display: flex;
		flex-direction: row;
		gap: 6%;

		.flaticon-container, .freepik-container, .allrecipes-container {
			display: flex;
			flex-direction: column;

			.flaticon-text, .freepik-text, .allrecipes-text {
				color: white;
				font-family: Gotu, serif;
				font-size: 0.8rem;
				white-space: nowrap;
			}

			.flaticon-logo, .freepik-logo, .allrecipes-logo {
				height: 30px;
			}
		}
	}

	@media screen and (max-width: 690px){
		.logo {
			display: none;
		}

		.flaticon-logo, .freepik-logo, .allrecipes-logo {
			height: 20px !important;
		}
	}
}
</style>
