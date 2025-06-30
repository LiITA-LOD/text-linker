MODEL_URL="https://datacloud.di.unito.it/index.php/s/mJQf9HNsErkrQjk/download/LiITA_model.tgz"

LiITA_model.tgz:
	curl -L -o $@ $(MODEL_URL)

LiITA_model: LiITA_model.tgz
	tar -xvf $^

