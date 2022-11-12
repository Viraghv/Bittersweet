<template>
	<div class="footer">
		<router-link class="col-3 col-md-2 col-xl-1" :to="{name: 'Home'}">
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
	justify-content: right;
	position: fixed;
	bottom: 0;
	width: 100%;
	background-color: var(--darkgrey);
	padding: 2vh 4vh;
	z-index: 20;

	.logo{
		width: 100%;
	}

}
</style>
