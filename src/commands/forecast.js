const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetchForecast } = require("../requests/forecast");

const data = new SlashCommandBuilder()
   .setName("forecast")
   .setDescription("Replies with the weather forecast!")
   .addStringOption((option) => {
      return option
         .setName("location")
         .setDescription("The location can be a city, zip/postal code, or latitude and longitude.")
         .setRequired(true);
   })
   .addStringOption((option) => {
      return option
         .setName("units")
         .setDescription('The unit system of the results: either "Celsius" or "Fahrenheit". ')
         .setRequired(false)
         .addChoices(
            {
               name: "Celsius",
               value: "celsius",
            },
            {
               name: "Fahrenheit",
               value: "fahrenheit",
            }
         );
   });

async function execute(interaction) {
   await interaction.deferReply();

   const location = interaction.options.getString("location");
   const units = interaction.options.getString("units") || "fahrenheit";
   const isFahrenheit = units === "fahrenheit";

   try {
      const { weatherData, locationName } = await fetchForecast(location);

      const embed = new EmbedBuilder()
         .setColor(0x3f704d)
         .setTitle(`Weather forecast for ${locationName}...`)
         .setDescription(`Using the ${units} system.`)
         .setTimestamp()
         .setFooter({
            text: "Powered by the weatherapi.com API",
         });

      for (const day of weatherData) {
         const tempMin = isFahrenheit ? day.tempMinF : day.tempMinC;
         const tempMax = isFahrenheit ? day.tempMaxF : day.tempMaxC;

         embed.addFields({
            name: day.date,
            value: `⬇️ Low: ${tempMin}°, ⬆️ High: ${tempMax}°`,
         });
      }

      await interaction.editReply({
         embeds: [embed],
      });
   } catch (err) {
      await interaction.editReply(err);
   }
}

module.exports = {
   data,
   execute,
};
