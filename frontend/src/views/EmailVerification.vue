<template>

</template>

<script>
export default {
	name: "EmailVerification",
	props: {
		token: String,
	},

	methods: {
		async verifyWithToken(){
			try {
				const response = await this.axios.get(`/user/verification/${this.token}`);
			} catch (error) {
				console.log(error.response.data);
			}
		}
	},

	mounted() {
		this.verifyWithToken();
	}
}
</script>

<style scoped lang="scss">

</style>